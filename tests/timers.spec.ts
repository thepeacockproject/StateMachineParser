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

import { test, Timer } from "../src"
import assert from "assert"

const data = {
    After1: [
        {
            $after: 5
        },
        {}
    ],
    After2: [
        {
            $after: 8
        },
        {}
    ]
}

/** Sat Jan 01 2022 00:00:00 GMT-0500 (Eastern Standard Time) */
const START_2022 = 1641013200000
/** Sat Jan 01 2022 00:00:05 GMT-0500 (Eastern Standard Time) */
const START_2022_5 = 1641013205000

describe("$after", () => {
    it("returns false with no timer array specified", () => {
        const [sm, vars] = data.After1
        assert.strictEqual(test(sm, vars), false)
    })

    function validateAfter1(timers: Timer[]) {
        assert.strictEqual(timers.length, 1, "incorrect timer count")
        assert.strictEqual(timers[0].startTime, START_2022, "start time not correct")
        assert.strictEqual(timers[0].endTime, START_2022_5, "end time not correct")
    }

    it("supports basic timers", () => {
        const [sm, vars] = data.After1

        const timers: Timer[] = []

        const result = test(sm, vars, { timers, eventTimestamp: START_2022 })

        validateAfter1(timers)

        assert.strictEqual(result, false, "timer returned true")

        // now, let's try again, pretending 5 seconds have passed
        const result2 = test(sm, vars, {
            timers, eventTimestamp: START_2022_5
        })

        validateAfter1(timers)

        assert.strictEqual(result2, true, "timer returned false")
    })
})
