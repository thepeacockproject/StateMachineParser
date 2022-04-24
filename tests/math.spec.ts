import { test } from "../src"
import assert from "assert"

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
        const [sm, vars] = data.Gt1
        assert.strictEqual(test(sm, vars), true)
    })

    it("does the math correctly", () => {
        const [sm, vars] = data.Gt2
        assert.strictEqual(test(sm, vars), false)
    })

    it("fails with the same numbers", () => {
        const [sm, vars] = data.Gt3
        assert.strictEqual(test(sm, vars), false)
    })
})

describe("$lt", () => {
    it("understands $lt with equality", () => {
        const [sm, vars] = data.Lt1
        assert.strictEqual(test(sm, vars), true)
    })

    it("does the math correctly", () => {
        const [sm, vars] = data.Lt2
        assert.strictEqual(test(sm, vars), false)
    })

    it("fails with the same numbers", () => {
        const [sm, vars] = data.Lt3
        assert.strictEqual(test(sm, vars), false)
    })
})
