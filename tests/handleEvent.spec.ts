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
                { eventName: input.Name }
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

            if (event === 5) {
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
                "we should not have transitioned yet"
            )
        }
    })
})
