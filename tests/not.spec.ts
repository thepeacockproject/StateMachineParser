import { test } from "../src"
import assert from "assert"

const data = {
    Not1: [
        {
            $not: true,
        },
        {},
    ],
}

it("$not true is false", () => {
    const [sm, globals] = data.Not1
    assert.strictEqual(test(sm, globals), false)
})
