import { test, TimerManager } from "../src"
import assert from "assert"

const data = {
    After1: [
        {
            $after: 10,
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

it("returns false with no timer manager specified", () => {
    const [sm, globals] = data.After1
    assert.strictEqual(test(sm, globals), false)
})

it("doesn't return true until a 5 second timer is up", function testTimers5(done) {
    this.timeout(7000)

    const [sm, globals] = data.After2
    const tm = new TimerManager()

    let done1 = false

    function queueDone() {
        if (!done1) {
            done1 = true
            return
        }

        return done()
    }

    assert.strictEqual(
        test(sm, globals, {
            timerManager: tm,
        }),
        false
    )

    setTimeout(() => {
        assert.strictEqual(test(sm, globals, { timerManager: tm }), false)
        queueDone()
    }, 2000)

    setTimeout(() => {
        assert.strictEqual(test(sm, globals, { timerManager: tm }), true)
        queueDone()
    }, 5000)
})
