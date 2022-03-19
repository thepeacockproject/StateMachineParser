/**
 *    Copyright 2022 The Peacock Project
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

import { set } from "./lodash-set"
import arrayEqual from "array-equal"

function findNamedChild(
    reference: string,
    variables: Record<string, any>
): any {
    if (typeof reference !== "string") {
        return reference
    }

    if (reference.includes("#")) {
        return reference
    }

    if (reference.startsWith("$")) {
        reference = reference.substring(1)
    }

    let obj = variables

    // if we have a global matching the exact name of the reference, this is probably what we want
    if (Object.prototype.hasOwnProperty.call(obj, reference)) {
        return obj[reference]
    }

    if (reference.includes(".")) {
        // the thing has a dot in it, which means that its accessing a global
        const parts = reference.split(".")

        for (let part of parts) {
            obj = obj?.[part]
        }

        return obj
    }

    return reference // it's just a string
}

export interface Options {
    /**
     * The path to the current value in the current object, for interactive debugger stepping.
     */
    _path?: string

    /**
     * The findNamedChild function that should be used for resolution of variables.
     */
    findNamedChild: FindNamedChildFunc
}

export function test(
    input: any,
    variables: Record<string, unknown>,
    options?: Options
): any {
    if (input === null || input === undefined) {
        throw new Error("State machine is null or undefined")
    }

    if (variables === null || variables === undefined) {
        throw new Error("Variables are null or undefined")
    }

    if (options?._path) {
        throw new Error("Hey, I make the paths, not you!!")
    }

    return realTest(input, variables, {
        findNamedChild: options?.findNamedChild ?? findNamedChild,
        ...(options ?? {}),
        _path: "ROOTOBJ",
    })
}

function realTest(
    input: any,
    variables: Record<string, unknown>,
    options: Options
): any {
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
        return input.map((val, index) =>
            realTest(val, variables, {
                ...options,
                _path: `${options._path}[${index}]`,
            })
        )
    }

    if (typeof input === "object") {
        if (input.hasOwnProperty("$eq")) {
            // transform any strings inside these arrays into their intended context values
            const predicate = (val, index) =>
                realTest(val, variables, {
                    ...options,
                    _path: `${options._path}.$eq[${index}]`,
                })

            if (Array.isArray(input.$eq[0] || input.$eq[1])) {
                return arrayEqual(
                    input.$eq[0].map(predicate),
                    input.$eq[1].map(predicate)
                )
            }

            return (
                // we test twice because we need to make sure that the value is fixed if it's a variable
                realTest(input["$eq"][0], variables, {
                    ...options,
                    _path: `${options._path}.$eq[0]`,
                }) ===
                realTest(input["$eq"][1], variables, {
                    ...options,
                    _path: `${options._path}.$eq[1]`,
                })
            )
        }

        if (input.hasOwnProperty("$not")) {
            return !realTest(input["$not"], variables, {
                ...options,
                _path: `${options._path}.$not`,
            })
        }

        if (input.hasOwnProperty("$and")) {
            return input["$and"].every((val, index) =>
                realTest(val, variables, {
                    ...options,
                    _path: `${options._path}.$and[${index}]`,
                })
            )
        }

        if (input.hasOwnProperty("$or")) {
            return input["$or"].some((val, index) =>
                realTest(val, variables, {
                    ...options,
                    _path: `${options._path}.$or[${index}]`,
                })
            )
        }

        if (input.hasOwnProperty("$gt")) {
            return (
                realTest(input["$gt"][0], variables, {
                    ...options,
                    _path: `${options._path}.$gt[0]`,
                }) >
                realTest(input["$gt"][1], variables, {
                    ...options,
                    _path: `${options._path}.$gt[1]`,
                })
            )
        }

        if (input.hasOwnProperty("$gte")) {
            return (
                realTest(input["$gte"][0], variables, {
                    ...options,
                    _path: `${options._path}.$gte[0]`,
                }) >=
                realTest(input["$gte"][1], variables, {
                    ...options,
                    _path: `${options._path}.$gte[1]`,
                })
            )
        }

        if (input.hasOwnProperty("$lt")) {
            return (
                realTest(input["$lt"][0], variables, {
                    ...options,
                    _path: `${options._path}.$lt[0]`,
                }) <
                realTest(input["$lt"][1], variables, {
                    ...options,
                    _path: `${options._path}.$lt[1]`,
                })
            )
        }

        if (input.hasOwnProperty("$lte")) {
            return (
                realTest(input["$lte"][0], variables, {
                    ...options,
                    _path: `${options._path}.$lte[0]`,
                }) <=
                realTest(input["$lte"][1], variables, {
                    ...options,
                    _path: `${options._path}.$lte[1]`,
                })
            )
        }

        const inarray = (op: string, all: boolean): boolean => {
            const array = realTest(input[op]["in"], variables, {
                ...options,
                _path: `${options._path}["${op}"]["in"]`,
            })

            const nodeOpts = Object.keys(input[op]["?"])
            const firstOp = input[op]["?"][nodeOpts[0]]! as unknown[]
            // where the current item in the array is in the equals check
            const locationOfComparator = firstOp.indexOf("$.#")
            const firstNonComparandValue = firstOp.find(
                (_, index) => index !== locationOfComparator
            )
            const firstNonComparandIndex = firstOp.indexOf(
                firstNonComparandValue
            )

            const expected = realTest(firstNonComparandValue, variables, {
                ...options,
                _path: `${options._path}["${op}"]["in"][${firstNonComparandIndex}]`,
            })

            for (const item of array) {
                if (item === realTest(expected, variables, options)) {
                    return true
                }

                if (all) {
                    return false
                }
            }

            return false
        }

        if (input.hasOwnProperty("$inarray")) {
            return inarray("$inarray", false)
        }

        if (input.hasOwnProperty("$any")) {
            return inarray("$any", false)
        }

        if (input.hasOwnProperty("$all")) {
        }

        if (input.hasOwnProperty("$after")) {
            // TODO we should implement proper timers
            return true
        }
    }

    console.warn("Unhandled test", input)

    return false
}

/**
 * @internal
 */
export type RealTestFunc = typeof realTest

/**
 * @internal
 */
export type FindNamedChildFunc = typeof findNamedChild

export function handleActions(
    input: any,
    variables: { [key: string]: any }
): { [key: string]: any } {
    if (input === null || input === undefined || typeof input !== "object") {
        return variables
    }

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
        let reference = input["$set"][0]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const value = findNamedChild(input["$set"][1], variables)

        set(variables, reference, value)
    }

    const push = (unique: boolean): void => {
        let reference = input["$push"][0]

        if (reference.startsWith("$")) {
            reference = reference.substring(1)
        }

        const value = findNamedChild(input["$push"][1], variables)

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

    return variables
}
