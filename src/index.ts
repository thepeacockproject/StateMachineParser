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

import { findNamedChild, FindNamedChildFunc, set } from "./utils"
import { handleArrayLogic } from "./arrayHandling"
import { handleEvent } from "./handleEvent"
import {
    TimerManager,
    TIMER_COMPLETE,
    TIMER_CANCELLED,
    TIMER_RUNNING,
    TimerStatus,
    TimerCallback,
    Timer,
} from "./timers"
import debug from "debug"

export interface Options {
    /**
     * The findNamedChild function that should be used for resolution of
     * variables.
     */
    findNamedChild: FindNamedChildFunc

    /**
     * How many nested loop nodes we are currently in - used to determine what
     * the value of the current iterator should point to.
     */
    _currentLoopDepth?: number

    /**
     * The path to the current value in the current object, for interactive
     * debugger stepping and tracing.
     */
    _path?: string

    /**
     * The timer manager instance. If not defined, timers will never be started,
     * and will always return false.
     */
    timerManager?: TimerManager
}

export function test<Variables = Record<string, unknown>>(
    input: any,
    variables: Variables,
    options?: Partial<Options>
): boolean | any {
    if (input === null || input === undefined) {
        throw new Error("State machine is falsey!")
    }

    if (variables === null || variables === undefined) {
        throw new Error("Context is falsey!")
    }

    if (options?._path) {
        throw new Error(
            "Paths can only be specified internally, not by API consumers."
        )
    }

    return realTest(input, variables, {
        findNamedChild: options?.findNamedChild || findNamedChild,
        ...(options || {}),
        _path: "ROOTOBJ",
        _currentLoopDepth: 0,
    })
}

/**
 * Tiny wrapper function that calls {@link realTest} with a path specified.
 * The benefit of using this is that it's a single, inline call, instead of 4
 * lines per call.
 */
function testWithPath(input: any, variables, options: Options, name: string) {
    return realTest(input, variables, {
        ...options,
        _path: `${options._path}.${name}`,
    })
}

function realTest<Variables, Return = Variables | boolean>(
    input: any,
    variables: Variables,
    options: Options
): Variables | boolean {
    const trace = debug("smparser:trace")

    trace(`Visiting ${options._path}`)

    if (
        typeof input === "number" ||
        typeof input === "boolean" ||
        input === null ||
        input === undefined
    ) {
        return input
    }

    if (typeof input === "string") {
        const realKeyName = input.startsWith("$") ? input.slice(1) : input

        return options.findNamedChild(realKeyName, variables)
    }

    if (Array.isArray(input)) {
        // @ts-expect-error Type mismatch thing.
        return input.map((val, index) =>
            testWithPath(val, variables, options, `[${index}]`)
        )
    }

    if (typeof input === "object") {
        if (input.hasOwnProperty("$eq")) {
            // transform any strings inside these arrays into their intended context values
            if (Array.isArray(input.$eq[0] || input.$eq[1])) {
                trace("attempted to compare arrays (can't!)")
                return false
            }

            return (
                // we test twice because we need to make sure that the value is fixed if it's a variable
                testWithPath(input.$eq[0], variables, options, "$eq[0]") ===
                testWithPath(input.$eq[1], variables, options, "$eq[1]")
            )
        }

        if (input.hasOwnProperty("$not")) {
            return !testWithPath(input.$not, variables, options, "$not")
        }

        if (input.hasOwnProperty("$and")) {
            return input.$and.every((val, index) =>
                testWithPath(val, variables, options, `$and[${index}]`)
            )
        }

        if (input.hasOwnProperty("$or")) {
            return input.$or.some((val, index) =>
                testWithPath(val, variables, options, `$or[${index}]`)
            )
        }

        if (input.hasOwnProperty("$gt")) {
            return (
                testWithPath(input.$gt[0], variables, options, "$gt[0]") >
                testWithPath(input.$gt[1], variables, options, "$gt[1]")
            )
        }

        if (input.hasOwnProperty("$gte")) {
            return (
                testWithPath(input.$gte[0], variables, options, "$gte[0]") >=
                testWithPath(input.$gte[1], variables, options, "$gte[1]")
            )
        }

        if (input.hasOwnProperty("$lt")) {
            return (
                testWithPath(input.$lt[0], variables, options, "$lt[0]") <
                testWithPath(input.$lt[1], variables, options, "$lt[1]")
            )
        }

        if (input.hasOwnProperty("$lte")) {
            return (
                testWithPath(input.$lte[0], variables, options, "$lte[0]") <=
                testWithPath(input.$lte[1], variables, options, "$lte[1]")
            )
        }

        if (input.hasOwnProperty("$inarray")) {
            return handleArrayLogic(
                realTest,
                input,
                variables,
                "$inarray",
                options
            )
        }

        if (input.hasOwnProperty("$any")) {
            return handleArrayLogic(realTest, input, variables, "$any", options)
        }

        if (input.hasOwnProperty("$all")) {
            return handleArrayLogic(realTest, input, variables, "$all", options)
        }

        if (input.hasOwnProperty("$after")) {
            if (!options.timerManager) {
                return false
            }

            let timer = options.timerManager.getTimer(`${options._path}.$after`)

            if (!timer) {
                // add timer details
                timer = options.timerManager.createTimer(
                    `${options._path}.$after`,
                    // @ts-expect-error Yes it's a number.
                    <number>realTest(input.$after, variables, {
                        ...options,
                        _path: `${options._path}.$after`,
                    })
                )
            }

            if (
                timer.state === TIMER_CANCELLED ||
                timer.state === TIMER_RUNNING
            ) {
                return false
            }

            if (timer.state === TIMER_COMPLETE) {
                return true
            }

            throw new Error("Invalid timer state!")
        }
    }

    console.warn("Unhandled test", input)

    return false
}

/**
 * @internal
 */
export type RealTestFunc = typeof realTest

export function handleActions<Context>(
    input: any,
    variables: Context
): Context {
    if (!input || typeof input !== "object") {
        return variables
    }

    // TODO: Refactor this into a switch statement using the object keys instead of hasOwn.

    const addOrDec = (op: string) => {
        if (typeof input[op] === "string") {
            const variableValue = findNamedChild(input[op], variables)

            let reference = input[op]

            if (reference.startsWith("$")) {
                reference = reference.substring(1)
            }

            set(
                variables,
                reference,
                op === "$inc" ? variableValue + 1 : variableValue - 1
            )
        } else {
            let reference = input[op][0]

            if (reference.startsWith("$")) {
                reference = reference.substring(1)
            }

            const variableValue = findNamedChild(reference, variables)
            const incrementBy = findNamedChild(input[op][1], variables)

            set(
                variables,
                reference,
                op === "$inc"
                    ? variableValue + incrementBy
                    : variableValue - incrementBy
            )
        }
    }

    const mulOrDiv = (op: string) => {
        let reference = input[op][2]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const variableValue1 = findNamedChild(input[op][0], variables)
        const variableValue2 = findNamedChild(input[op][1], variables)

        set(
            variables,
            reference,
            op === "$mul"
                ? variableValue1 * variableValue2
                : variableValue1 / variableValue2
        )
    }

    if (input.hasOwnProperty("$inc")) {
        addOrDec("$inc")
    }

    if (input.hasOwnProperty("$dec")) {
        addOrDec("$dec")
    }

    if (input.hasOwnProperty("$mul")) {
        mulOrDiv("$mul")
    }

    if (input.hasOwnProperty("$div")) {
        mulOrDiv("$div")
    }

    if (input.hasOwnProperty("$set")) {
        let reference = input.$set[0]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const value = findNamedChild(input.$set[1], variables)

        set(variables, reference, value)
    }

    const push = (unique: boolean): void => {
        const op = unique ? "$pushunique" : "$push"
        let reference = input[op][0]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const value = findNamedChild(input[op][1], variables)

        // clone the thing
        const array = JSON.parse(
            JSON.stringify(findNamedChild(reference, variables))
        )

        if (unique) {
            if (array.indexOf(value) === -1) {
                array.push(value)
            } else {
                return
            }
        } else {
            array.push(value)
        }

        set(variables, reference, array)
    }

    if (input.hasOwnProperty("$push")) {
        push(false)
    }

    if (input.hasOwnProperty("$pushunique")) {
        push(true)
    }

    if (input.hasOwnProperty("$remove")) {
        let reference = input.$remove[0]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const value = findNamedChild(input.$remove[1], variables)

        // clone the thing
        let array: unknown[] = JSON.parse(
            JSON.stringify(findNamedChild(reference, variables))
        )

        array = array.filter((item) => item !== value)

        set(variables, reference, array)
    }

    return variables
}

export {
    handleEvent,
    TIMER_COMPLETE,
    TIMER_CANCELLED,
    TIMER_RUNNING,
    Timer,
    TimerManager,
}
export type { TimerStatus, TimerCallback }
