import { set } from "../src/utils"
import assert from "assert"

describe("utils", () => {
    describe("dset", () => {
        it("won't allow prototype pollution", () => {
            // this may or may not be to cover this branch during code coverage...

            set(Object, ["prototype", "func"], function func() {
                return "polluted"
            })

            // @ts-expect-error I know.
            assert.strictEqual(Object.prototype.func, undefined, "prototype pollution succeeded")
        })
    })
})
