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

import { findNamedChild, set } from "../src/utils"
import assert from "assert"

// the main purpose of this is just to improve code coverage

describe("utils", () => {
    describe("dset", () => {
        it("won't allow prototype pollution", () => {
            // this may or may not be to cover this branch during code coverage...

            set(Object, ["prototype", "func"], function func() {
                return "polluted"
            })

            assert.strictEqual(
                // @ts-expect-error I know.
                Object.prototype.func,
                undefined,
                "prototype pollution succeeded"
            )
        })
    })

    describe("findNamedChild", () => {
        it("has the Count property on arrays", () => {
            const input = {
                Items: ["apple", "banana", "orange", "pear"],
            }

            assert.strictEqual(findNamedChild("$Items.Count", input), 4)
        })

        it("returns the input if it is a loop", () => {
            assert.strictEqual(findNamedChild("$.#", {}), "$.#")
        })
    })
})
