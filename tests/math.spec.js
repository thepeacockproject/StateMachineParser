const { check } = require("../build/cjs/index")

const data = {
    Gt1: [
        {
            $eq: [
                {
                    $gt: [10, 5],
                },
                true,
            ],
        },
        {},
    ],
    Gt2: [
        {
            $eq: [
                {
                    $gt: [5, 10],
                },
                true,
            ],
        },
        {},
    ],
    Gt3: [
        {
            $eq: [
                {
                    $gt: [3, 3],
                },
                true,
            ],
        },
        {},
    ],
}

describe("$gt", () => {
    it("understands $gt with equality", () => {
        const [sm, globals] = data.Gt1
        expect(check(sm, globals)).toBe(true)
    })

    it("does the math correctly", () => {
        const [sm, globals] = data.Gt2
        expect(check(sm, globals)).toBe(false)
    })

    it("fails with the same numbers", () => {
        const [sm, globals] = data.Gt3
        expect(check(sm, globals)).toBe(false)
    })
})
