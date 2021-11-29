const { check } = require("../build/cjs/index")

const data = {
    After1: [
        {
            $after: 10,
        },
        {},
    ],
}

it("returns true with a basic timer", () => {
    const [sm, globals] = data.After1
    expect(check(sm, globals).bool).toBe(true)
})
