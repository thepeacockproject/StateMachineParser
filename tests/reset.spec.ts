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

import { handleActions } from "../src"
import assert from "assert"

const data = {
    Reset1: [
        {
            $push: ["Targets", "grappigegovert"],
            $reset: "Targets",
        },
        {
            Targets: ["RDIL", "MoonySolari", "Tony"],
        },
    ],
    Reset2: [
        {
            $push: ["Targets", "Tony"],
            $reset: "Targets",
        },
        {
            Targets: [],
        },
    ],
}

describe("$reset", () => {
    // We use spread syntax below to quick and dirty "clone" it, otherwise it gets transformed
    it("can reset a non-empty array", () => {
        const [sm, vars] = data.Reset1
        const r = handleActions(sm, vars, { originalContext: { ...vars } })
        assert.strictEqual(r.Targets?.length, 3)
    })

    it("can reset an empty array", () => {
        const [sm, vars] = data.Reset2
        const r = handleActions(sm, vars, { originalContext: { ...vars } })
        assert.strictEqual(r.Targets?.length, 0)
    })
})
