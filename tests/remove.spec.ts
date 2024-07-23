/*
 *    Copyright (c) 2022-2024 The Peacock Project
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

import assert from "assert"
import { handleActions } from "../src"

const data = {
    Remove1: [
        {
            $remove: ["$FavoriteFoods", "pickles"],
        },
        {
            FavoriteFoods: ["apples", "oranges", "pickles"],
        },
    ],
}

describe("$remove", () => {
    it("can remove an object from the array", () => {
        const [sm, vars] = data.Remove1

        const r = handleActions(sm, vars)

        assert.strictEqual(
            JSON.stringify(r.FavoriteFoods),
            JSON.stringify(["apples", "oranges"]),
        )
    })
})
