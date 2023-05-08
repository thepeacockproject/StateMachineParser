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

import { handleActions } from "../src"
import assert from "assert"

const data = {
    Set1: [
        {
            $set: ["MyContextObject", "$.OtherContextObject"],
        },
        {
            MyContextObject: 1,
            OtherContextObject: 5,
        },
    ],
    Set2: [
        {
            $set: ["Some.Context.Object", 103],
        },
        {
            Some: {
                Context: {
                    Object: 0,
                },
            },
        },
    ],
}

describe("$set", () => {
    it("can set a basic context object", () => {
        const [sm, vars] = data.Set1
        const r = handleActions(sm, vars)
        assert.strictEqual(r.MyContextObject, 5)
        assert.strictEqual(r.OtherContextObject, 5)
    })

    it("can set a basic context object to a literal value", () => {
        const [sm, vars] = data.Set2
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Some.Context.Object, 103)
    })
})
