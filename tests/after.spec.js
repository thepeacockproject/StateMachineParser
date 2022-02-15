const { test } = require("../src/index")

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
    expect(test(sm, globals)).toBe(true)
})
