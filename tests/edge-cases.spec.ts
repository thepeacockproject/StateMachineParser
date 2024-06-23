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
import { handleActions, handleEvent } from "../src"
import * as assert from "assert"

describe("edge cases", () => {
    describe("get/set values from strings", () => {
        it("can tolerate strange but valid references (get)", () => {
            const ctx = {
                JNames: ["jim", "joe", "jacob"],
            }

            const result = findNamedChild("($.JNames).Count", ctx)

            assert.strictEqual(result, 3, "expected value not present")
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

    describe("trying to modify non-existant context vars does not error", () => {
        it("using the $inc action", () => {
            const action1 = {
                $inc: ["MyCoolArray", 1],
            }
            const action2 = {
                $inc: "MyCoolArray"
            }
            const context = {}
            
            let newContext = handleActions(action1, context)
            newContext = handleActions(action2, newContext)

            assert.deepStrictEqual(newContext, {})
        })

        it("using the $dec action", () => {
            const action1 = {
                $dec: ["MyCoolArray", 2],
            }
            const action2 = {
                $dec: "MyCoolArray",
            }
            const context = {}
            
            let newContext = handleActions(action1, context)
            newContext = handleActions(action2, newContext)

            assert.deepStrictEqual(newContext, {})
        })

        it("using the $mul action", () => {
            const action = {
                $mul: ["MyCoolArray", 3],
            }
            const context = {}
            
            const newContext = handleActions(action, context)

            assert.deepStrictEqual(newContext, {})
        })

        it("using the $push action", () => {
            const action = {
                $push: ["MyCoolArray", 4],
            }
            const context = {}
            
            const newContext = handleActions(action, context)

            assert.deepStrictEqual(newContext, {})
        })

        it("using the $pushunique action", () => {
            const action = {
                $pushunique: ["MyCoolArray", 5],
            }
            const context = {}
            
            const newContext = handleActions(action, context)

            assert.deepStrictEqual(newContext, {})
        })

        it("using the $remove action", () => {
            const action = {
                $remove: ["MyCoolArray", 6],
            }
            const context = {}
            
            const newContext = handleActions(action, context)

            assert.deepStrictEqual(newContext, {})
        })

        it("using the $pushunique condition", () => {
            const Definition = {
                Context: {},
                States: {
                    Start: {
                        EventName: {
                            Condition: {
                                $pushunique: ["MyOtherCoolArray", "bofa"],
                            },
                        },
                    },
                },
            }
            const Input = {
                Name: "EventName",
                Value: {},
            }

            const result = handleEvent(
                Definition,
                Definition.Context,
                Input.Value,
                {
                    currentState: "Start",
                    eventName: Input.Name,
                    timestamp: 0,
                },
            )

            assert.deepStrictEqual(result.context, {})
        })
    })
})
