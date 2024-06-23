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

describe("essential validation", () => {
    it("doesn't accept null or undefined variables", () => {
        assert.throws(() => test({ $eq: [true, true] }, null), {
            message: "Context is falsy!",
        })

        assert.throws(() => test({ $eq: [true, true] }, undefined), {
            message: "Context is falsy!",
        })
    })

    it("doesn't accept null or undefined statemachine conditions", () => {
        assert.throws(() => test(null, {}), {
            message: "State machine is falsy!",
        })
        assert.throws(() => test(undefined, {}), {
            message: "State machine is falsy!",
        })
    })

    it("maps an array of strings to their proper values in test", () => {
        const input = ["$.Hello", "Greetings", "$Bonjour"]
        const context = {
            Hello: "Hi!",
            Bonjour: "Hello in French!",
        }
        const expected = JSON.stringify([
            "Hi!",
            "Greetings",
            "Hello in French!",
        ])

        const result = test(input, context)

        assert.strictEqual(
            JSON.stringify(result),
            expected,
            "arrays did not match"
        )
    })
})
