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
    Push1: [
        {
            $push: ["$Animals", "snake"],
        },
        {
            Animals: ["dog", "cat", "bird"],
        },
    ],
    PushUnique1: [
        {
            $pushunique: ["$People", "Viktor Novikov"],
        },
        {
            People: ["Dalia Margolis", "Silvio Caruso", "Francesca De Santis"],
        },
    ],
    PushUnique2: [
        {
            $pushunique: ["$People", "Dalia Margolis"],
        },
        {
            People: [
                "Viktor Novikov",
                "Dalia Margolis",
                "Silvio Caruso",
                "Francesca De Santis",
            ],
        },
    ],
}

describe("$push", () => {
    it("can push an element and cause a different output", () => {
        const [sm, vars] = data.Push1
        assert.strictEqual(vars.Animals.length, 3)

        const output = handleActions(sm, vars)

        assert.strictEqual(output.Animals.length, 4)
        assert.strictEqual(output.Animals[3], "snake")
    })
})

describe("$pushunique", () => {
    it("can push just like $push", () => {
        const [sm, vars] = data.PushUnique1
        assert.strictEqual(vars.People.length, 3)

        const output = handleActions(sm, vars)

        assert.strictEqual(output.People.length, 4)
        assert.strictEqual(output.People[3], "Viktor Novikov")
    })

    it("obeys the unique part of its job", () => {
        const [sm, vars] = data.PushUnique2
        assert.strictEqual(vars.People.length, 4)

        const output = handleActions(sm, vars)

        assert.strictEqual(output.People.length, 4)
        // check the last item in it, which should still be Franny
        assert.strictEqual(output.People.reverse()[0], "Francesca De Santis")
    })
})
