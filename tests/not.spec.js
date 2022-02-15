const { test } = require("../src/index")

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
    expect(test(sm, globals)).toBe(false)
})
