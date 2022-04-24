import { test } from "../src"
import assert from "assert"

describe("essential validation", () => {
    it("doesn't accept null or undefined variables", () => {
        assert.throws(() => test({ $eq: [true, true] }, null), {
            message: "Context is falsey!",
        })

        assert.throws(() => test({ $eq: [true, true] }, undefined), {
            message: "Context is falsey!",
        })
    })

    it("doesn't accept null or undefined statemachine conditions", () => {
        assert.throws(() => test(null, {}), {
            message: "State machine is falsey!",
        })
        assert.throws(() => test(undefined, {}), {
            message: "State machine is falsey!",
        })
    })
})
