/*
 *    Copyright (c) 2022 The Peacock Project
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { handleEvent } from "./handleEvent"
import { HandleActionsOptions, TestOptions } from "./types"
import { deepClone, findNamedChild, set } from "./utils"
import { handleArrayLogic } from "./arrayHandling"

/**
 * Recursively evaluate a value or object.
 * If something that isn't a state machine object is passed in, it will be
 * translated where possible (e.g. strings will be attempted to be evaluated
 * into the values they correspond to inside the context object). If the value
 * can't be evaluated, the input will be returned.
 *
 * @param input The state machine or value.
 * @param context The context object.
 * @param options The options.
 * @returns The result of the evaluation.
 */
export function test<Context = Record<string, unknown>>(
    input: any,
    context: Context,
    options?: Partial<TestOptions>
): boolean | any {
    if (!input) {
        throw new Error("State machine is falsy!")
    }

    if (!context) {
        throw new Error("Context is falsy!")
    }

    const opts = options || {}

    return realTest(input, context, {
        findNamedChild: opts.findNamedChild || findNamedChild,
        ...opts,
        _path: opts._path || "ROOTOBJ",
        _currentLoopDepth: 0,
        logger: opts.logger || (() => {}),
    })
}

/**
 * Tiny wrapper function that calls {@link realTest} with a path specified.
 * The benefit of using this is that it's a single, inline call, instead of 4
 * lines per call.
 */
function testWithPath(input: any, context, options: TestOptions, name: string) {
    return realTest(input, context, {
        ...options,
        _path: `${options._path}.${name}`,
    })
}

function realTest<Variables, Return = Variables | boolean>(
    input: any,
    variables: Variables,
    options: TestOptions
): Variables | boolean {
    const log = options.logger

    log("visit", `Visiting ${options._path}`)

    if (
        typeof input === "number" ||
        typeof input === "boolean" ||
        input === null ||
        input === undefined
    ) {
        return input
    }

    if (typeof input === "string") {
        return options.findNamedChild(input, variables)
    }

    if (Array.isArray(input)) {
        // @ts-expect-error Type mismatch thing.
        return input.map((val, index) =>
            testWithPath(val, variables, options, `[${index}]`)
        )
    }

    if (typeof input === "object") {
        for (const key of Object.keys(input)) {
            switch (key) {
                case "$eq": { 
                    // transform any strings inside these arrays into their intended context values
                    if (input.$eq.some((val) => Array.isArray(val))) {
                        log("validation", "attempted to compare arrays (can't!)")
                        return false
                    }

                    const res = testWithPath(input.$eq[0], variables, options, "$eq[0]")

                    return (
                        // we test for each element because we need to make sure that the value is fixed if it's a variable
                        input.$eq.every(
                            (val, index) =>
                                index === 0 ||
                                testWithPath(
                                    val,
                                    variables,
                                    options,
                                    `$eq[${index}]`
                                ) === res
                        )
                    )
                }
                case "$not": {
                    return !testWithPath(input.$not, variables, options, "$not")
                }
                case "$and": {
                    return input.$and.every((val, index) =>
                        testWithPath(val, variables, options, `$and[${index}]`)
                    )
                }
                case "$or": {
                    return input.$or.some((val, index) =>
                        testWithPath(val, variables, options, `$or[${index}]`)
                    )
                }
                case "$gt": {
                    return (
                        testWithPath(input.$gt[0], variables, options, "$gt[0]") >
                        testWithPath(input.$gt[1], variables, options, "$gt[1]")
                    )
                }
                case "$ge": {
                    return (
                        testWithPath(input.$ge[0], variables, options, "$ge[0]") >=
                        testWithPath(input.$ge[1], variables, options, "$ge[1]")
                    )
                }
                case "$lt": {
                    return (
                        testWithPath(input.$lt[0], variables, options, "$lt[0]") <
                        testWithPath(input.$lt[1], variables, options, "$lt[1]")
                    )
                }
                case "$le": {
                    return (
                        testWithPath(input.$le[0], variables, options, "$le[0]") <=
                        testWithPath(input.$le[1], variables, options, "$le[1]")
                    )
                }
                case "$inarray": {
                    return handleArrayLogic(
                        realTest,
                        input,
                        variables,
                        "$inarray",
                        options
                    )
                }
                case "$any": {
                    return handleArrayLogic(realTest, input, variables, "$any", options)
                }
                case "$all": {
                    return handleArrayLogic(realTest, input, variables, "$all", options)
                }
                case "$after": {
                    const path = `${options._path}.$after`
        
                    if (!options.timers) {
                        return false
                    }
        
                    let timer = options.timers.find((timer) => timer.path === path)
        
                    if (!timer) {
                        const seconds = <number>(
                            testWithPath(input.$after, variables, options, "$after")
                        )
        
                        // zero is falsy, hence the extra check
                        if (!options.eventTimestamp && options.eventTimestamp !== 0) {
                            log(
                                "validation",
                                "No event timestamp found when timer is supposed to be active"
                            )
                            return false
                        }
        
                        timer = {
                            startTime: options.eventTimestamp,
                            endTime: options.eventTimestamp + seconds,
                            path,
                        }
        
                        options.timers.push(timer)
                    }
        
                    log("eventStamp", String(options.eventTimestamp))
                    log("endTime", String(timer.endTime))
        
                    if (options.eventTimestamp >= timer.endTime) {
                        // The timer is up. Delete it from the timers array
                        // so that a new timer can be created if this state is visited again.
                        const index = options.timers.findIndex(
                            (timer) => timer.path === path
                        )
        
                        if (index !== -1) {
                            options.timers.splice(index, 1)
                        }
        
                        return true
                    }
        
                    return false
                }
                case "$pushunique": {
                    return options.pushUniqueAction?.(
                        input.$pushunique[0],
                        testWithPath(
                            input.$pushunique[1],
                            variables,
                            options,
                            "$pushunique[1]"
                        )
                    )
                }
                case "$contains": {
                    const first = testWithPath(
                        input.$contains[0],
                        variables,
                        options,
                        "$contains[0]"
                    )
                    const second = testWithPath(
                        input.$contains[1],
                        variables,
                        options,
                        "$contains[1]"
                    )
        
                    if (typeof first === "string") {
                        return first.includes(second)
                    }
        
                    return false
                }
            }
        }
    }

    log("unhandled", `Unhandled test: '${input}'`)

    return false
}

/**
 * @internal
 */
export type RealTestFunc = typeof realTest

/**
 * Handles a group of action nodes (a.k.a. side-effect nodes).
 * Actions will modify the context, which will then be returned.
 *
 * @param input The actions to take.
 * @param context The context.
 * @param options The options.
 * @returns The modified context.
 * @example
 *  let context = { Number: 8 }
 *  const actions = {
 *      // increment the value of Number by 1
 *      $inc: "$Number",
 *  }
 *  context = handleActions(actions, context)
 *  // context will now be { Number: 9 }
 */
export function handleActions<Context>(
    input: any,
    context: Context,
    options?: HandleActionsOptions
): Context {
    if (!input || typeof input !== "object") {
        return context
    }

    const addOrDec = (op: string) => {
        if (typeof input[op] === "string") {
            const variableValue = findNamedChild(input[op], context)

            let reference = input[op]

            set(
                context,
                reference,
                op === "$inc" ? variableValue + 1 : variableValue - 1
            )
        } else {
            let reference = input[op][0]

            const variableValue = findNamedChild(reference, context)
            const incrementBy = findNamedChild(input[op][1], context)

            set(
                context,
                reference,
                op === "$inc"
                    ? variableValue + incrementBy
                    : variableValue - incrementBy
            )
        }
    }

    const push = (unique: boolean): void => {
        const op = unique ? "$pushunique" : "$push"
        let reference = input[op][0]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const value = findNamedChild(input[op][1], context)

        // clone the thing
        const array = deepClone(findNamedChild(reference, context))

        if (unique) {
            if (array.indexOf(value) === -1) {
                array.push(value)
            } else {
                return
            }
        } else {
            array.push(value)
        }

        set(context, reference, array)
    }

    for (const key of Object.keys(input)) {
        switch (key) {
            case "$inc": {
                addOrDec("$inc")
                break
            }
            case "$dec": {
                addOrDec("$dec")
                break
            }
            case "$mul": {
                // $mul can have 2 or 3 operands, 2 means multiply the context variable (1st operand) by the 2nd operand
                let reference = input["$mul"][input["$mul"].length === 3 ? 2 : 0]
        
                const variableValue1 = findNamedChild(input["$mul"][0], context)
                const variableValue2 = findNamedChild(input["$mul"][1], context)
        
                set(context, reference, variableValue1 * variableValue2)
                break
            }
            case "$set": {
                let reference = input.$set[0]

                const value = findNamedChild(input.$set[1], context)

                set(context, reference, value)
                break
            }
            case "$push": {
                push(false)
                break
            }
            case "$pushunique": {
                push(true)
                break
            }
            case "$remove": {
                let reference = input.$remove[0]
        
                if (reference.startsWith("$")) {
                    reference = reference.substring(1)
                }
        
                const value = findNamedChild(input.$remove[1], context)
        
                // clone the thing
                let array: unknown[] = deepClone(findNamedChild(reference, context))
        
                array = array.filter((item) => item !== value)
        
                set(context, reference, array)
                break
            }
            case "$reset": {
                let reference = input.$reset
                const value = findNamedChild(reference, options.originalContext)
        
                set(context, reference, value)
                break
            }
        }
    }

    return context
}

export { handleEvent }
export * from "./types"
