const { check } = require("../build/cjs/index")

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
    expect(check(sm, globals).bool).toBe(false)
})
