import { test } from "../src"
import assert from "assert"

describe("essential validation", () => {
    it("doesn't accept null or undefined globals", () => {
        assert.throws(() => test({ $eq: [true, true] }, null), {
            message: "Variables are null or undefined",
        })

        assert.throws(() => test({ $eq: [true, true] }, undefined), {
            message: "Variables are null or undefined",
        })
    })

    it("doesn't accept null or undefined statemachine conditions", () => {
        assert.throws(() => test(null, {}), {
            message: "State machine is null or undefined",
        })
        assert.throws(() => test(undefined, {}), {
            message: "State machine is null or undefined",
        })
    })
})
