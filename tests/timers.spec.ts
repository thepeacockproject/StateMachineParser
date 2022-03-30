import { test, TimerManager, TIMER_RUNNING, TIMER_CANCELLED, Timer } from "../src"
import assert from "assert"

const data = {
    Timer1: [
        {
            $after: 5,
        },
        {}
    ]
}

describe("timer managers", () => {
    it("registers and properly creates timers", function registersAndCreatesTimersTest(done) {
        this.timeout(6_000)

        const [sm, globals] = data.Timer1

        const timerManager = new (class extends TimerManager {
            override createTimer(path: string, length: number): Timer {
                const t = new Timer(length, () => done())
                this.timers.set(path, t)
                return t
            }
        })

        assert.strictEqual(timerManager.timers.size, 0)

        test(sm, globals, { timerManager })

        assert.strictEqual(timerManager.timers.size, 1)

        assert.strictEqual(timerManager.timers.values().next().value.state, TIMER_RUNNING)
    })

    it("can cancel timers", (done) => {
        const [sm, globals] = data.Timer1

        const timerManager = new (class extends TimerManager {
            override createTimer(path: string, length: number): Timer {
                const t = new Timer(length, () => done())
                this.timers.set(path, t)
                return t
            }
        })

        assert.strictEqual(timerManager.timers.size, 0)

        test(sm, globals, { timerManager })

        assert.strictEqual(timerManager.timers.size, 1)

        const firstTimer = timerManager.timers.values().next().value as Timer

        assert.strictEqual(firstTimer.state, TIMER_RUNNING)

        firstTimer.cancel()

        assert.strictEqual(firstTimer.state, TIMER_CANCELLED)
    })
})
