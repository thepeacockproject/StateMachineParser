import { test } from "../src"
import assert from "assert"
import { describe } from "mocha"

const data = {
    Or1: [
        {
            $or: [false, true],
        },
        {},
    ],
    Or2: [
        {
            $or: [
                {
                    $eq: ["$Value.IsTrue", true],
                },
                {
                    $eq: ["$Value.IsUndefined", "nothing here"],
                },
            ],
        },
        {
            Value: {
                IsTrue: true,
            },
        },
    ],
    Or3: [
        {
            $or: [
                {
                    $eq: [10, 20],
                },
                false,
            ],
        },
        {},
    ],
}

describe("$or", () => {
    it("can do $or with booleans", () => {
        const [sm, vars] = data.Or1
        assert.strictEqual(test(sm, vars), true)
    })

    it("can do $or with equality", () => {
        const [sm, vars] = data.Or2
        assert.strictEqual(test(sm, vars), true)
    })

    it("fails when neither condition is true", () => {
        const [sm, vars] = data.Or3
        assert.strictEqual(test(sm, vars), false)
    })
})
