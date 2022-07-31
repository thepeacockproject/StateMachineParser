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

import { DeepCloneFunction } from "./types"

const PROTOTYPE_POLLUTION_KEYS = ["__proto__", "constructor", "prototype"]

/**
 * When we are getting or setting a named child, we don't want:
 * - A leading $
 * - A leading $.
 * - Any ( or )
 */
function replaceBadCharacters(input: string): string {
    while (input.includes("(") || input.includes(")")) {
        input = input.replace("(", "").replace(")", "")
    }

    if (input.startsWith("$.")) {
        return input.substring(2)
    }

    if (input.startsWith("$")) {
        return input.substring(1)
    }

    return input
}

/**
 * Dependency 'dset'.
 * @license MIT
 * @see https://github.com/lukeed/dset/blob/master/src/index.js
 * @internal
 */
export function set(obj: any, keys: string | string[], val: any): void {
    if (typeof keys === "string") {
        keys = replaceBadCharacters(keys)
        keys = keys.split(".")
    }

    let i = 0,
        len = keys.length,
        curr = obj,
        currKey,
        key

    while (i < len) {
        key = keys[i++]

        // prevent prototype pollution
        if (PROTOTYPE_POLLUTION_KEYS.includes(key)) {
            break
        }

        if (i === len) {
            curr = curr[key] = val
            continue
        }

        // noinspection PointlessArithmeticExpressionJS
        curr = curr[key] =
            typeof (currKey = curr[key]) === typeof keys
                ? currKey
                : // @ts-expect-error Very interesting type stuff going on here.
                keys[i] * 0 !== 0 || !!~("" + keys[i]).indexOf(".")
                ? {}
                : []
    }
}

/**
 * Evaluates a reference to a property as a string into the actual value.
 * For instance, `myObj.property.hi` would be the same as
 * `myObj["property"]["hi"]` in actual JavaScript.
 *
 * @param reference The reference to the target as a string.
 * @param variables The object that may contain the target.
 * @returns The value if found, or the reference if it wasn't /
 * something went wrong.
 */
export function findNamedChild(reference: string, variables: any): any {
    if (typeof reference !== "string") {
        return reference
    }

    // no prototype pollution please
    for (const pollutant of PROTOTYPE_POLLUTION_KEYS) {
        if (reference.includes(pollutant)) {
            return reference
        }
    }

    if (reference.includes("#")) {
        return reference
    }

    reference = replaceBadCharacters(reference)

    let obj = variables

    // if we have a global matching the exact name of the reference, this is probably what we want
    if (Object.prototype.hasOwnProperty.call(obj, reference)) {
        return obj[reference]
    }

    if (reference.includes(".")) {
        // the thing has a dot in it, which means that it's accessing a global
        const parts = reference.split(".")

        for (let part of parts) {
            // Arrays have a custom property, `Count`, which is equal to their length
            if (part === "Count" && Array.isArray(obj)) {
                obj = (obj as unknown[]).length

                continue
            }

            obj = obj?.[part]
        }

        return obj
    }

    return reference // it's just a string
}

/**
 * @internal
 */
export const defaultDeepClone: DeepCloneFunction<any> = (t: any) => {
    return JSON.parse(JSON.stringify(t))
}
