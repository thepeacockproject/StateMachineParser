import { set, sha1 } from "../src/utils"
import assert from "assert"

// the main purpose of this is just to improve code coverage

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

    describe("sha1", () => {
        assert.strictEqual(sha1(""), "da39a3ee5e6b4b0d3255bfef95601890afd80709", "sha1 calc of empty string is wrong")
        assert.strictEqual(sha1("hello-world"), "fbb969117edfa916b86dfb67fd11decf1e336df0", "sha1 calc of 'hello-world' is wrong")
        assert.strictEqual(sha1("abcdef"), "1f8ac10f23c5b5bc1167bda84b833e5c057a77d2", "sha1 calc of 'abcdef' is wrong")
        assert.strictEqual(sha1("128734598"), "6c7ffcb2e7e8bef9e956b7998c48cf4d9d53d831", "sha1 calc of '128734598' is wrong")
    })
})
