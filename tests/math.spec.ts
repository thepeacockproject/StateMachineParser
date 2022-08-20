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
import * as data from "./math.data.json"
import assert from "assert"

describe("$gt", () => {
    it("understands $gt with equality", () => {
        const [sm, vars] = data.Gt1
        assert.strictEqual(test(sm, vars), true)
    })

    it("does the math correctly", () => {
        const [sm, vars] = data.Gt2
        assert.strictEqual(test(sm, vars), false)
    })

    it("fails with the same numbers", () => {
        const [sm, vars] = data.Gt3
        assert.strictEqual(test(sm, vars), false)
    })
})

describe("$lt", () => {
    it("understands $lt with equality", () => {
        const [sm, vars] = data.Lt1
        assert.strictEqual(test(sm, vars), true)
    })

    it("does the math correctly", () => {
        const [sm, vars] = data.Lt2
        assert.strictEqual(test(sm, vars), false)
    })

    it("fails with the same numbers", () => {
        const [sm, vars] = data.Lt3
        assert.strictEqual(test(sm, vars), false)
    })
})
