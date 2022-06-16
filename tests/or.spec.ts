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

import { test } from "../src"
import assert from "assert"
import { describe } from "mocha"

const data = {
    Or1: [
        {
            $or: [false, true],
        },
        {},
    ],
    Or2: [
        {
            $or: [
                {
                    $eq: ["$Value.IsTrue", true],
                },
                {
                    $eq: ["$Value.IsUndefined", "nothing here"],
                },
            ],
        },
        {
            Value: {
                IsTrue: true,
            },
        },
    ],
    Or3: [
        {
            $or: [
                {
                    $eq: [10, 20],
                },
                false,
            ],
        },
        {},
    ],
}

describe("$or", () => {
    it("can do $or with booleans", () => {
        const [sm, vars] = data.Or1
        assert.strictEqual(test(sm, vars), true)
    })

    it("can do $or with equality", () => {
        const [sm, vars] = data.Or2
        assert.strictEqual(test(sm, vars), true)
    })

    it("fails when neither condition is true", () => {
        const [sm, vars] = data.Or3
        assert.strictEqual(test(sm, vars), false)
    })
})
