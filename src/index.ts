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

export function test(input: any, variables: Record<string, unknown>): any {
    if (input === null || input === undefined) {
        throw new Error("State machine is null or undefined")
    }

    if (variables === null || variables === undefined) {
        throw new Error("Variables are null or undefined")
    }

    return realTest(input, variables)
}

function realTest(input: any, variables: Record<string, unknown>): any {
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

        return findNamedChild(realKeyName, variables)
    }

    if (typeof input === "object") {
        if (input.hasOwnProperty("$eq")) {
            // transform any strings inside these arrays into their intended context values
            const predicate = (val) => realTest(val, variables)

            if (Array.isArray(input.$eq[0] || input.$eq[1])) {
                return arrayEqual(
                    input.$eq[0].map(predicate),
                    input.$eq[1].map(predicate)
                )
            }

            return (
                // we test twice because we need to make sure that the value is fixed if it's a variable
                realTest(input["$eq"][0], variables) ===
                realTest(input["$eq"][1], variables)
            )
        }

        if (input.hasOwnProperty("$not")) {
            return !realTest(input["$not"], variables)
        }

        if (input.hasOwnProperty("$and")) {
            return input["$and"].every((val) => realTest(val, variables))
        }

        if (input.hasOwnProperty("$or")) {
            return input["$or"].some((val) => realTest(val, variables))
        }

        if (input.hasOwnProperty("$gt")) {
            return (
                realTest(input["$gt"][0], variables) >
                realTest(input["$gt"][1], variables)
            )
        }

        if (input.hasOwnProperty("$gte")) {
            return (
                realTest(input["$gte"][0], variables) >=
                realTest(input["$gte"][1], variables)
            )
        }

        if (input.hasOwnProperty("$lt")) {
            return (
                realTest(input["$lt"][0], variables) <
                realTest(input["$lt"][1], variables)
            )
        }

        if (input.hasOwnProperty("$lte")) {
            return (
                realTest(input["$lte"][0], variables) <=
                realTest(input["$lte"][1], variables)
            )
        }

        if (input.hasOwnProperty("$inarray")) {
            const array = realTest(input["$inarray"]["in"], variables)

            const equalityCheck = input["$inarray"]["?"]["$eq"] as unknown[]
            // where the current item in the array is in the equals check
            const locationOfComparator = equalityCheck.indexOf("$.#")

            const expected = realTest(
                equalityCheck.find(
                    (_, index) => index !== locationOfComparator
                ),
                variables
            )

            for (const item of array) {
                if (item === realTest(expected, variables)) {
                    return true
                }
            }

            return false
        }

        if (input.hasOwnProperty("$after")) {
            // TODO we should implement proper timers
            return true
        }
    }

    if (Array.isArray(input)) {
        if (input.some((val) => typeof val === "object")) {
            return input.every((val) => realTest(val, variables))
        }

        return input.map((val) => {
            return typeof val === "string" && val.includes(".")
                ? findNamedChild(val, variables)
                : val
        })
    }

    console.warn("Unhandled test", input)

    return false
}

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

    return variables
}
