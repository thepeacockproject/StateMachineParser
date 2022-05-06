import { test } from "../src"
import assert from "assert"

const data = {
    Not1: [
        {
            $not: true,
        },
        {},
    ],
    Not2: [
        {
            $not: {
                $not: true,
            },
        },
        {},
    ],
}

describe("$not", () => {
    it("$not true is false", () => {
        const [sm, vars] = data.Not1
        assert.strictEqual(test(sm, vars), false)
    })

    it("nested $not", () => {
        const [sm, vars] = data.Not2
        assert.strictEqual(test(sm, vars), true)
    })
})
