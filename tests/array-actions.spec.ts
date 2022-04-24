import { handleActions } from "../src"
import assert from "assert"

const data = {
    Push1: [
        {
            $push: ["$Animals", "snake"]
        },
        {
            Animals: ["dog", "cat", "bird"]
        },
    ]
}

describe("$push", () => {
    it("can push an element and cause a different", () => {
        const [sm, vars] = data.Push1
        assert.strictEqual(vars.Animals.length, 3)

        const output = handleActions(sm, vars)

        assert.strictEqual(output.Animals.length, 4)
        assert.strictEqual(output.Animals[3], "snake")
    })
})

describe("$pushunique", () => {

})
