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
})

describe("$after", () => {
    it("returns false with no timer manager specified", () => {
        const [sm, vars] = data.After1
        assert.strictEqual(test(sm, vars), false)
    })
})
