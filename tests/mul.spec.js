const { check } = require("../build/cjs/index")

const data = {
    Mul1: [
        {
            $eq: [
                {
                    $mul: [9, 9],
                },
                81,
            ],
        },
        {}
    ],
    Mul2: [
        {
            $mul: [9, 9],
        },
        {}
    ],
    Mul3: [
        {
            $eq: [
                {
                    $mul: ["$.MagicNumber", 8]
                },
                24
            ],
        },
        {
            $: {
                MagicNumber: 3
            }
        }
    ]
}

it("can check equality of $mul(9,9)", () => {
    const [sm, globals] = data.Mul1
    expect(check(sm, globals)).toBe(true)
})

it("the answer of a raw $mul is correct", () => {
    const [sm, globals] = data.Mul2
    expect(check(sm, globals)).toBe(81)
})

it("can multiply with a input from context", () => {
    const [sm, globals] = data.Mul3
    expect(check(sm, globals)).toBe(true)
})
