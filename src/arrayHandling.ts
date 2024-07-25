/*
 *    Copyright (c) 2022-2024 The Peacock Project
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

import type { RealTestFunc, TestOptions } from "./index"

const fillHashtags = (count: number): string => "#".repeat(count)

/**
 * Handles `$any`, `$all`, and `$inarray`. Works with nested loops!
 * @param realTest The realTest function.
 * @param input The state machine.
 * @param variables The variables.
 * @param op The operation being performed.
 * @param options The test options.
 * @internal
 */
export function handleArrayLogic<Variables>(
    realTest: RealTestFunc,
    input: any,
    variables: Variables,
    op: string,
    options: TestOptions
): boolean {
    const inValue = input[op]["in"]
    const depth = (options._currentLoopDepth || 0) + 1

    if (inValue.includes("#")) {
        throw new TypeError("Nested array nodes cannot use current iteration (`$.#`) as an `in` value", {
            cause: options._path
        })
    }

    // find the array
    const array = realTest(inValue, variables, {
        ...options,
        _currentLoopDepth: depth,
        _path: `${options._path}.${op}.in`
    }) as unknown as unknown[]

    const itemConditions = input[op]["?"]

    for (const item of array) {
        const test = realTest(itemConditions, variables, {
            ...options,
            _currentLoopDepth: depth,
            _path: `${options._path}.${op}.?`,
            findNamedChild(reference, variables) {
                // NOTE: if we have a multi-layered loop, this should one-by-one fall back until the targeted loop is hit
                const hashtags = fillHashtags(depth)

                // a little future-proofing, as sometimes the $ is there, and other times it isn't.
                // we strip it out somewhere, but it shouldn't matter too much.
                if (
                    reference === `$.${hashtags}` ||
                    reference === `.${hashtags}`
                ) {
                    return item
                }

                // handle properties of an object
                if (typeof item === "object") {
                    const newReference = `$${reference.substring(
                        reference.indexOf("#.") + 1
                    )}`
                    const found = options.findNamedChild(newReference, item)
                    if (found !== newReference) return found
                }

                return options.findNamedChild(reference, variables)
            }
        })

        if (test && (op === "$inarray" || op === "$any")) {
            return true
        }

        if (!test && op === "$all") {
            return false
        }
    }

    // if this is an all request, each condition was met
    // otherwise, only some (or possibly none) worked
    return op === "$all"
}
