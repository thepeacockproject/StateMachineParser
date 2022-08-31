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
import callSpy from "call-spy"

const data = {
    After1: [
        {
            $after: 5,
        },
        {},
    ],
    After2: [
        {
            $after: 8,
        },
        {},
    ],
}

describe("$after", () => {
    it("returns false with no timer array specified", () => {
        const [sm, vars] = data.After1

        assert.strictEqual(test(sm, vars), false)
    })

    it("won't try to evaluate if no timestamp is specified", () => {
        const [sm, vars] = data.After1

        const [logger, loggerCallDetails] = callSpy((category, message) => {
            if (category === "validation") {
                assert.strictEqual(
                    message,
                    "No event timestamp found when timer is supposed to be active"
                )
            }
        })

        assert.strictEqual(test(sm, vars, { timers: [], logger }), false)
        assert.strictEqual(loggerCallDetails.called, true)
    })

    it("supports basic timers", () => {
        function validate(timers: Timer[]) {
            assert.strictEqual(timers.length, 1, "incorrect timer count")
            assert.strictEqual(timers[0].startTime, 0, "start time not correct")
            assert.strictEqual(timers[0].endTime, 8, "end time not correct")
        }

        const [sm, vars] = data.After2

        const timers: Timer[] = []

        const result = test(sm, vars, { timers, eventTimestamp: 0 })

        validate(timers)

        assert.strictEqual(result, false, "timer returned true")

        // now, let's try again, pretending 8 seconds have passed
        const result2 = test(sm, vars, {
            timers,
            eventTimestamp: 8,
        })

        validate(timers)

        assert.strictEqual(result2, true, "timer returned false")
    })
})
