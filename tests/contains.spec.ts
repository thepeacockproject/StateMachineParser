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
import * as assert from "assert"

// noinspection SpellCheckingInspection
const data = {
    Contains1: [
        {
            $contains: ["$Greeting", "ello"],
        },
        {
            Greeting: "Hello!",
        },
    ],
    Contains2: [
        {
            $contains: ["Lime", "Coconut"],
        },
        {},
    ],
}

describe("$contains", () => {
    it("can tell if a string contains a substring", () => {
        const [sm, context] = data.Contains1

        const result = test(sm, context)

        assert.strictEqual(result, true, "contains check was false")
    })

    it("can tell if a string does not contain another substring", () => {
        const [sm, context] = data.Contains2

        const result = test(sm, context)

        assert.strictEqual(result, false, "contains check was true")
    })
})
