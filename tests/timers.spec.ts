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

import {
    test,
    TimerManager,
    TIMER_RUNNING,
    TIMER_CANCELLED,
    Timer,
} from "../src"
import assert from "assert"

const data = {
    Timer1: [
        {
            $after: 5,
        },
        {},
    ],
    After1: [
        {
            $after: 8,
        },
        {},
    ],
    After2: [
        {
            $after: 5,
        },
        {},
    ],
}

describe("timer managers", function timerManagers() {
    this.timeout(6_000)

    it("registers and properly creates timers", (done) => {
        const [sm, vars] = data.Timer1

        const timerManager = new (class extends TimerManager {
            override createTimer(path: string, length: number): Timer {
                const t = new Timer(length, () => {
                    done()
                })
                this.timers.set(path, t)
                return t
            }
        })()

        assert.strictEqual(timerManager.timers.size, 0)

        test(sm, vars, { timerManager })

        assert.strictEqual(timerManager.timers.size, 1)

        assert.strictEqual(
            timerManager.timers.values().next().value.state,
            TIMER_RUNNING
        )
    })

    it("can cancel timers", (testDone) => {
        const [sm, vars] = data.Timer1

        const timerManager = new (class extends TimerManager {
            override createTimer(path: string, length: number): Timer {
                const t = new Timer(length, () => {
                    testDone()
                })
                this.timers.set(path, t)
                return t
            }
        })()

        assert.strictEqual(timerManager.timers.size, 0)

        test(sm, vars, { timerManager })

        assert.strictEqual(timerManager.timers.size, 1)

        const firstTimer = timerManager.timers.values().next().value as Timer

        assert.strictEqual(firstTimer.state, TIMER_RUNNING)

        firstTimer.cancel()

        assert.strictEqual(firstTimer.state, TIMER_CANCELLED)
    })

    it("won't allow the status of a timer to be a non-approved value", () => {
        assert.throws(() => {
            const timer = new Timer(0.5, () => null)
            // @ts-expect-error We are intentionally testing this.
            timer.state = "YOLO"
        })
    })
})

describe("$after", () => {
    it("returns false with no timer manager specified", () => {
        const [sm, vars] = data.After1
        assert.strictEqual(test(sm, vars), false)
    })
})
