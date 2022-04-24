import { test } from "../src"
import assert from "assert"

const data = {
    And1: [
        {
            $and: [
                {
                    $eq: ["true", "true"],
                },
                {
                    $eq: [7, 7],
                },
            ],
        },
        {},
    ],
    And2: [
        {
            $and: [
                {
                    $eq: ["true", "yes"],
                },
                {
                    $eq: [7, 7],
                },
            ],
        },
        {},
    ],
    And3: [
        {
            $and: [
                {
                    $eq: ["val2", "val2"],
                },
            ],
        },
        {},
    ],
    And4: [
        {
            $and: [
                {
                    $eq: ["val3", "val3"],
                },
                {
                    $eq: ["Conditions.3", "hello"],
                },
                {
                    $eq: [false, false],
                },
                {
                    $eq: [[], []],
                },
            ],
        },
        {
            Conditions: {
                3: "hello",
            },
        },
    ],
}

describe("$and", () => {
    it("understands $and with equality", () => {
        const [sm, vars] = data.And1
        assert.strictEqual(test(sm, vars), true)
    })

    it("$and fails when a condition is not met", () => {
        const [sm, vars] = data.And2
        assert.strictEqual(test(sm, vars), false)
    })

    it("$and works with less and more than 2 conditions", () => {
        const [sm, vars] = data.And3
        assert.strictEqual(test(sm, vars), true)

        const [sm2, vars2] = data.And4
        assert.strictEqual(test(sm2, vars2), true)
    })
})
