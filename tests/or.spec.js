const { check } = require("../build/cjs/index")

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
                    $eq: ["$Value.IsTrue", true]
                },
                {
                    $eq: ["$Value.IsUndefined", "nothing here"]
                },
            ],
        },
        {
            $Value: {
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
    ]
}

it("can do $or with booleans", () => {
    const [sm, globals] = data.Or1
    expect(check(sm, globals)).toBe(true)
})

it("can do $or with equality", () => {
    const [sm, globals] = data.Or2
    expect(check(sm, globals)).toBe(true)
})

it("fails when neither condition is true", () => {
    const [sm, globals] = data.Or3
    expect(check(sm, globals)).toBe(false)
})
