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
    All1: [
        {
            $all: {
                in: "$Trues",
                "?": {
                    $eq: ["$.#", true],
                },
            },
        },
        {
            Trues: [true, true],
        },
    ],
    All2: [
        {
            $all: {
                in: "$NotAllTrues",
                "?": {
                    $eq: ["$.#", true],
                },
            },
        },
        {
            NotAllTrues: [true, false],
        },
    ],
}

describe("$all", () => {
    it("can ensure all items are true", () => {
        const [sm, vars] = data.All1
        assert.strictEqual(test(sm, vars), true)
    })
    it("can properly detect when items are not true", () => {
        const [sm, vars] = data.All2
        assert.strictEqual(test(sm, vars), false)
    })
})
