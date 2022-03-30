import { test } from "../src"
import assert from "assert"

const data = {
    Equality1: [
        {
            $eq: [1, 1],
        },
        {},
    ],
    Equality2: [
        {
            $eq: ["Hello", "Hello"],
        },
        {},
    ],
    Equality3: [
        {
            $eq: ["$Value.Greeting", "Hello World!"],
        },
        {
            Value: {
                Greeting: "Hello World!",
            },
        },
    ],
    Inequality1: [
        {
            $eq: [1, 2],
        },
        {},
    ],
    NestedEq1: [
        {
            $eq: [
                {
                    $eq: [5, 5],
                },
                true,
            ],
        },
        {},
    ],
    NestedNeq1: [
        {
            $eq: [
                {
                    $eq: [5, 10],
                },
                true,
            ],
        },
        {},
    ],
}

it("1 $eq 1", () => {
    const [sm, globals] = data.Equality1
    assert.strictEqual(test(sm, globals), true)
})

it("$eq with strings", () => {
    const [sm, globals] = data.Equality2
    assert.strictEqual(test(sm, globals), true)
})

it("$eq with globals", () => {
    const [sm, globals] = data.Equality3
    assert.strictEqual(test(sm, globals), true)
})

describe("inequality", () => {
    it("1 neq 2", () => {
        const [sm, globals] = data.Inequality1
        assert.strictEqual(test(sm, globals), false)
    })
})

describe("nested $eq", () => {
    it("can understand nested $eq", () => {
        const [sm, globals] = data.NestedEq1
        assert.strictEqual(test(sm, globals), true)
    })

    it("can understand nested !$eq", () => {
        const [sm, globals] = data.NestedNeq1
        assert.strictEqual(test(sm, globals), false)
    })
})
