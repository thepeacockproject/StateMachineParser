const { test } = require("../src/index")
const assert = require("assert")

const data = {
    After1: [
        {
            $after: 10,
        },
        {},
    ],
}

it("returns false with no timer manager specified", () => {
    const [sm, globals] = data.After1
    assert.strictEqual(test(sm, globals), false)
})
