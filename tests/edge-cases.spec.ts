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
import * as assert from "assert"

describe("edge cases", () => {
    describe("get/set values from strings", () => {
        it("can tolerate strange but valid references (get)", () => {
            const ctx = {
                JNames: ["jim", "joe", "jacob"],
            }

            const result = findNamedChild("($.JNames).Count", ctx)

            assert.strictEqual(
                result,
                3,
                "expected value not present"
            )
        })

        it("can tolerate strange but valid references (set)", () => {
            const ctx = {
                JNames: ["jim", "joe", "jacob"],
            }

            set(ctx, "$.JNames", ["bob", "bill", "ben"])

            assert.strictEqual(
                JSON.stringify(ctx),
                `{"JNames":["bob","bill","ben"]}`,
                "values not equal"
            )
        })
    })
})
