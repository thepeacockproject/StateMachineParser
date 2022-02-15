const { test } = require("../src/index")

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
    expect(test(sm, globals)).toBe(true)
})

it("$eq with strings", () => {
    const [sm, globals] = data.Equality2
    expect(test(sm, globals)).toBe(true)
})

it("$eq with globals", () => {
    const [sm, globals] = data.Equality3
    expect(test(sm, globals)).toBe(true)
})

describe("inequality", () => {
    it("1 neq 2", () => {
        const [sm, globals] = data.Inequality1
        expect(test(sm, globals)).toBe(false)
    })
})

describe("nested $eq", () => {
    it("can understand nested $eq", () => {
        const [sm, globals] = data.NestedEq1
        expect(test(sm, globals)).toBe(true)
    })

    it("can understand nested !$eq", () => {
        const [sm, globals] = data.NestedNeq1
        expect(test(sm, globals)).toBe(false)
    })
})
