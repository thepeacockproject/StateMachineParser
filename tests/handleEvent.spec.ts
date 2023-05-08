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

import { handleEvent } from "../src"
import assert from "assert"
import * as suites from "./handleEvent.data.json"

describe("handleEvent api", () => {
    it("can trace through a series of basic events", () => {
        const { Definition, Inputs } = suites.basicConditionalTransition

        let doneOnce = false
        for (const input of Inputs) {
            const result = handleEvent(
                Definition,
                Definition.Context,
                input.Value,
                { timestamp: 0, eventName: input.Name }
            )

            if (doneOnce) {
                assert.strictEqual(result.state, "Success")
            }

            if (!doneOnce) {
                doneOnce = true
            }
        }
    })

    it("can perform actions", () => {
        const { Definition, Inputs } = suites.conditionsActionsTransition
        let context: Required<typeof Definition.Context> = Definition.Context

        let event = 0
        for (const input of Inputs) {
            event++

            const result = handleEvent(Definition, context, input.Value, {
                timestamp: 0,
                currentState: "Start",
                eventName: input.Name,
            })

            context = <any>result.context

            if (event === 2) {
                assert.strictEqual(
                    result.context.Number,
                    5,
                    "$set action was not performed"
                )
            }

            if (event === 4) {
                assert.strictEqual(
                    result.state,
                    "NumberIsFive",
                    "not in NumberIsFive state"
                )
                break
            }

            assert.strictEqual(
                result.state,
                "Start",
                `Currently at event number ${event}. we should not have transitioned yet`
            )
        }
    })

    it("works with a basic immediate state", () => {
        const { Definition } = suites.immediateState

        let state = "Start"

        const result = handleEvent(Definition, {}, null, {
            currentState: state,
            eventName: "-",
            timestamp: 0,
        })

        assert.strictEqual(result.state, "Success", "Transition did not happen")
    })

    it("supports tests with constants", () => {
        const { Definition, Input } = suites.testWithConstants

        let state = "Start"

        const result = handleEvent(
            Definition,
            Definition.Context,
            Input.Value,
            {
                currentState: state,
                eventName: Input.Name,
                timestamp: 0,
            }
        )

        assert.strictEqual(result.state, "Success", "Transition did not happen")
    })

    it("supports actions with constants", () => {
        const { Definition, Input } = suites.actionWithConstants

        let state = "Start"

        const result = handleEvent(
            Definition,
            Definition.Context,
            Input.Value,
            {
                currentState: state,
                eventName: Input.Name,
                timestamp: 0,
            }
        )

        assert.strictEqual(result.context["Variable"], 500)
    })

    it("supports pushunique", () => {
        const { Definition, Input } = suites.pushUniqueAsCondition
        let context: Required<typeof Definition.Context> = Definition.Context
        let currentState = "Start"

        let result = handleEvent(Definition, context, Input.Value, {
            currentState,
            eventName: Input.Name,
            timestamp: 0,
        })

        context = <any>result.context
        currentState = result.state

        assert.strictEqual(
            currentState,
            "OnePacified",
            "Transition did not happen"
        )
        assert.strictEqual(
            context.Pacified.length,
            1,
            "Pacified array was not pushed"
        )

        // once more, we should now be in the OnePacified state
        result = handleEvent(Definition, context, Input.Value, {
            currentState,
            eventName: Input.Name,
            timestamp: 0,
        })

        assert.strictEqual(context.Pacified.length, 1, "Unique check failed")
        assert.strictEqual(
            result.state,
            "Success",
            "Second transition did not happen"
        )
    })

    it("can perform actions respecting the order of them", () => {
        const { Definition } = suites.ordering
        const context: Required<typeof Definition.Context> = Definition.Context

        const result = handleEvent(Definition, context, null, {
            currentState: "Start",
            eventName: "-",
            timestamp: 0,
        })

        assert.strictEqual(result.context.Var1, 1)
        assert.strictEqual(result.context.Var2, 20)
    })
})
