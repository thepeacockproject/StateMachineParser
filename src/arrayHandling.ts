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

import type { Options, RealTestFunc } from "./index"

const fillHashtags = (count: number): string => "#".repeat(count)

/**
 * Function that creates an array-like test node parser.
 * It's split into a separate file for the sake of organization, and uses the proxy function to avoid circular dependencies.
 *
 * @param realTest The realTest function (internal).
 * @param input The state machine.
 * @param variables The variables.
 * @param op The operation being performed.
 * @param options The test option.
 * @internal
 */
export function handleArrayLogic<Variables>(
    realTest: RealTestFunc,
    input: any,
    variables: Variables,
    op: string,
    options: Options
): boolean {
    // find the array
    const array = realTest(input[op]["in"], variables, {
        ...options,
        _currentLoopDepth: (options._currentLoopDepth || 0) + 1,
        _path: `${options._path}.${op}.in`,
    }) as unknown as unknown[]

    const itemConditions = input[op]["?"]

    for (const item of array) {
        const test = realTest(itemConditions, variables, {
            ...options,
            _currentLoopDepth: (options._currentLoopDepth || 0) + 1,
            findNamedChild(reference, variables) {
                // NOTE: if we have a multi-layered loop, this should one-by-one fall back until the targeted loop is hit
                const hashtags = fillHashtags(
                    (options._currentLoopDepth || 0) + 1
                )

                // a little future-proofing, as sometimes the $ is there, and other times it isn't.
                // we strip it out somewhere, but it shouldn't matter too much.
                if (
                    reference === `$.${hashtags}` ||
                    reference === `.${hashtags}`
                ) {
                    return item
                }

                return options.findNamedChild(reference, variables)
            },
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

/**
 * Shim of array-equal package.
 * @license MIT
 * @internal
 */
export function arraysAreEqual(arr1: any[], arr2: any[]): boolean {
    const length = arr1.length

    if (length !== arr2.length) {
        return false
    }

    for (let i = 0; i < length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false
        }
    }

    return true
}
