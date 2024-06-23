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
import * as data from "./inarray.data.json"
import assert from "assert"

describe("$inarray", () => {
    it("can find a string in a context array", () => {
        const [sm, vars] = data.Inarray1
        assert.strictEqual(test(sm, vars), true)
    })

    it("returns false if the item isn't present", () => {
        const [sm, vars] = data.Inarray2
        assert.strictEqual(test(sm, vars), false)
    })
})

describe("$any", () => {
    it("can find a string in a context array", () => {
        const [sm, vars] = data.Inarray1
        assert.strictEqual(test(sm, vars), true)
    })

    it("returns false if the item isn't present", () => {
        const [sm, vars] = data.Inarray2
        assert.strictEqual(test(sm, vars), false)
    })
})
