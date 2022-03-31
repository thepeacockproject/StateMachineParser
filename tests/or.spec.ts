import { test } from "../src"
import assert from "assert"

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

it("can do $or with booleans", () => {
    const [sm, globals] = data.Or1
    assert.strictEqual(test(sm, globals), true)
})

it("can do $or with equality", () => {
    const [sm, globals] = data.Or2
    assert.strictEqual(test(sm, globals), true)
})

it("fails when neither condition is true", () => {
    const [sm, globals] = data.Or3
    assert.strictEqual(test(sm, globals), false)
})