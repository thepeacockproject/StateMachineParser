/*
 *    Copyright (c) 2022 The Peacock Project
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { handleActions } from "../src"
import assert from "assert"

const data = {
    Inc1: [
        {
            $inc: ["Some.Context.Object", 6],
        },
        {
            Some: {
                Context: {
                    Object: 1,
                },
            },
        },
    ],
    Inc2: [
        {
            $inc: "Context.Object",
        },
        {
            Context: {
                Object: 150150,
            },
        },
    ],
    Dec1: [
        {
            $dec: ["Some.Context.Object", 6],
        },
        {
            Some: {
                Context: {
                    Object: 5,
                },
            },
        },
    ],
    Dec2: [
        {
            $dec: "Context.Object",
        },
        {
            Context: {
                Object: 150150,
            },
        },
    ],
    Mul1: [
        {
            $mul: ["Context.Object", 5, "Context.Object"],
        },
        {
            Context: {
                Object: 18,
            },
        },
    ],
}

describe("$inc", () => {
    it("can increment a context object", () => {
        const [sm, vars] = data.Inc1
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Some.Context.Object, 7)
    })

    it("can increment a context object with no amount specified", () => {
        const [sm, vars] = data.Inc2
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Context.Object, 150151)
    })
})

describe("$dec", () => {
    it("can decrement a context object", () => {
        const [sm, vars] = data.Dec1
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Some.Context.Object, -1)
    })

    it("can decrement a context object with no amount specified", () => {
        const [sm, vars] = data.Dec2
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Context.Object, 150149)
    })
})

describe("$mul", () => {
    it("can multiply a context object", () => {
        const [sm, vars] = data.Mul1
        const r = handleActions(sm, vars)
        assert.strictEqual(r.Context.Object, 90)
    })
})
