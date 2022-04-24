import { handleActions } from "../src"
import assert from "assert"

const data = {
    Set1: [
        {
            $set: ["MyContextObject", "OtherContextObject"],
        },
        {
            MyContextObject: 1,
            OtherContextObject: 5,
        },
    ],
    Set2: [
        {
            $set: ["Some.Context.Object", 103],
        },
        {
            Some: {
                Context: {
                    Object: 0,
                },
            },
        },
    ],
}

describe("$set", () => {
    it("can set a basic context object", () => {
        const [sm, vars] = data.Set1
        const r = handleActions(sm, vars)
        assert.strictEqual(r.MyContextObject, 5)
        assert.strictEqual(r.OtherContextObject, 5)
    })

    it("can set a basic context object to a literal value", () => {
        const [sm, vars] = data.Set2
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Some.Context.Object, 103)
    })
})
