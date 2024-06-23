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

import { test } from "../src"
import assert from "assert"

const data = {
    And1: [
        {
            $and: [
                {
                    $eq: ["true", "true"],
                },
                {
                    $eq: [7, 7],
                },
            ],
        },
        {},
    ],
    And2: [
        {
            $and: [
                {
                    $eq: ["true", "yes"],
                },
                {
                    $eq: [7, 7],
                },
            ],
        },
        {},
    ],
    And3: [
        {
            $and: [
                {
                    $eq: ["val2", "val2"],
                },
            ],
        },
        {},
    ],
    And4: [
        {
            $and: [
                {
                    $eq: ["val3", "val3"],
                },
                {
                    $eq: ["$.Conditions.3", "hello"],
                },
                {
                    $eq: [false, false],
                },
                {
                    $eq: ["fgdgfdgdfg", "fgdgfdgdfg"],
                },
            ],
        },
        {
            Conditions: {
                3: "hello",
            },
        },
    ],
}

describe("$and", () => {
    it("understands $and with equality", () => {
        const [sm, vars] = data.And1
        assert.strictEqual(test(sm, vars), true)
    })

    it("$and fails when a condition is not met", () => {
        const [sm, vars] = data.And2
        assert.strictEqual(test(sm, vars), false)
    })

    it("$and works with less and more than 2 conditions", () => {
        const [sm, vars] = data.And3
        assert.strictEqual(test(sm, vars), true)

        const [sm2, vars2] = data.And4
        assert.strictEqual(test(sm2, vars2), true)
    })
})
