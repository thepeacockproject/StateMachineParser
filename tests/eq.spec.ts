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
    Equality1: [
        {
            $eq: [1, 1],
        },
        {},
    ],
    Equality2: [
        {
            $eq: ["Hello", "Hello"],
        },
        {},
    ],
    Equality3: [
        {
            $eq: ["$Value.Greeting", "Hello World!"],
        },
        {
            Value: {
                Greeting: "Hello World!",
            },
        },
    ],
    Inequality1: [
        {
            $eq: [1, 2],
        },
        {},
    ],
    NestedEq1: [
        {
            $eq: [
                {
                    $eq: [5, 5],
                },
                true,
            ],
        },
        {},
    ],
    NestedNeq1: [
        {
            $eq: [
                {
                    $eq: [5, 10],
                },
                true,
            ],
        },
        {},
    ],
    LongArray1: [
        {
            $eq: [1, 1, 1, 1],
        },
        {},
    ],
}

describe("$eq", () => {
    it("1 $eq 1", () => {
        const [sm, vars] = data.Equality1
        assert.strictEqual(test(sm, vars), true)
    })

    it("$eq with strings", () => {
        const [sm, vars] = data.Equality2
        assert.strictEqual(test(sm, vars), true)
    })

    it("$eq with variables", () => {
        const [sm, vars] = data.Equality3
        assert.strictEqual(test(sm, vars), true)
    })

    context("inequality", () => {
        it("1 neq 2", () => {
            const [sm, vars] = data.Inequality1
            assert.strictEqual(test(sm, vars), false)
        })
    })

    context("nested $eq", () => {
        it("can understand nested $eq", () => {
            const [sm, vars] = data.NestedEq1
            assert.strictEqual(test(sm, vars), true)
        })

        it("can understand nested !$eq", () => {
            const [sm, vars] = data.NestedNeq1
            assert.strictEqual(test(sm, vars), false)
        })
    })

    it("array with more than 2 elements", () => {
        const [sm, vars] = data.LongArray1
        assert.strictEqual(test(sm, vars), true)
    })
})
