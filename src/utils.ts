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

// @ts-nocheck

export const PROTOTYPE_POLLUTION_KEYS = ["__proto__", "constructor", "prototype"]

/**
 * Dependency 'dset'.
 * @license MIT
 * @see https://github.com/lukeed/dset/blob/master/src/index.js
 * @internal
 */
export function set(obj, keys: string | string[], val): void {
    if (typeof keys === "string") {
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
                : keys[i] * 0 !== 0 || !!~("" + keys[i]).indexOf(".")
                ? {}
                : []
    }
}
