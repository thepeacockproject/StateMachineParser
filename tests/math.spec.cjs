const { test } = require("../src/index")
const assert = require("assert")

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
    Lt1: [
        {
            $eq: [
                {
                    $lt: [5, 10],
                },
                true,
            ],
        },
        {},
    ],
    Lt2: [
        {
            $lt: [10, 5],
        },
        {},
    ],
    Lt3: [
        {
            $eq: [
                {
                    $lt: [3, 3],
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
        assert.strictEqual(test(sm, globals), true)
    })

    it("does the math correctly", () => {
        const [sm, globals] = data.Gt2
        assert.strictEqual(test(sm, globals), false)
    })

    it("fails with the same numbers", () => {
        const [sm, globals] = data.Gt3
        assert.strictEqual(test(sm, globals), false)
    })
})

describe("$lt", () => {
    it("understands $lt with equality", () => {
        const [sm, globals] = data.Lt1
        assert.strictEqual(test(sm, globals), true)
    })

    it("does the math correctly", () => {
        const [sm, globals] = data.Lt2
        assert.strictEqual(test(sm, globals), false)
    })

    it("fails with the same numbers", () => {
        const [sm, globals] = data.Lt3
        assert.strictEqual(test(sm, globals), false)
    })
})
