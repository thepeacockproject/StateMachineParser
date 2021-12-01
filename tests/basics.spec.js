const { check } = require("../build/cjs/index")

describe("essential validation", () => {
    it("doesn't accept null or undefined globals", () => {
        expect(() => check({ $eq: [true, true] }, null)).toThrow(
            "Globals can't be null or undefined!"
        )
        expect(() => check({ $eq: [true, true] }, undefined)).toThrow(
            "Globals can't be null or undefined!"
        )
    })

    it("doesn't accept null or undefined statemachine conditions", () => {
        expect(() => check(null, {})).toThrow(
            "The statemachine conditions can't be null or undefined!"
        )
        expect(() => check(undefined, {})).toThrow(
            "The statemachine conditions can't be null or undefined!"
        )
    })
})
