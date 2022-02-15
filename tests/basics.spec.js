const { test } = require("../src/index")

describe("essential validation", () => {
    it("doesn't accept null or undefined globals", () => {
        expect(() => test({ $eq: [true, true] }, null)).toThrow(
            "Variables are null or undefined"
        )
        expect(() => test({ $eq: [true, true] }, undefined)).toThrow(
            "Variables are null or undefined"
        )
    })

    it("doesn't accept null or undefined statemachine conditions", () => {
        expect(() => test(null, {})).toThrow(
            "State machine is null or undefined"
        )
        expect(() => test(undefined, {})).toThrow(
            "State machine is null or undefined"
        )
    })
})
