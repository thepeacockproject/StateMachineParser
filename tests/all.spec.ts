import { test } from "../src"
import assert from "assert"

const data = {
    All1: [
        {
            $all: {
                in: "$Trues",
                "?": {
                    $eq: ["$.#", true]
                }
            }
        },
        {
            Trues: [true, true]
        }
    ],
    All2: [
        {
            $all: {
                in: "$NotAllTrues",
                "?": {
                    $eq: ["$.#", true]
                }
            }
        },
        {
            NotAllTrues: [true, false]
        }
    ]
}

describe("$all", () => {
    it("can ensure all items are true", () => {
        const [sm, vars] = data.All1
        assert.strictEqual(test(sm, vars), true)
    })
    it("can properly detect when items are not true", () => {
        const [sm, vars] = data.All2
        assert.strictEqual(test(sm, vars), false)
    })
})
