/**
 * A unique identifier indicating that a timer has successfully finished.
 */
export const TIMER_COMPLETE = Symbol.for("StateMachineTimerComplete")
/**
 * A unique identifier indicating that a timer has been cancelled before it was able to finish.
 */
export const TIMER_CANCELLED = Symbol.for("StateMachineTimerCancelled")
/**
 * A unique identifier indicating that a timer is currently running.
 */
export const TIMER_RUNNING = Symbol.for("StateMachineTimerRunning")
/**
 * The status of a timer. Can be running, cancelled, or completed.
 */
export type TimerStatus =
    | typeof TIMER_COMPLETE
    | typeof TIMER_CANCELLED
    | typeof TIMER_RUNNING

/**
 * The callback function that can be given to a timer.
 */
export type TimerCallback = (status: TimerStatus) => void

export class Timer {
    private _state: TimerStatus

    /**
     * The current status of a timer.
     */
    get state(): TimerStatus {
        return this._state
    }

    /**
     * Set the current status of a timer.
     *
     * @throws {TypeError} If the newState value is not an acceptable type.
     * @param newState The new state value.
     */
    set state(newState: TimerStatus) {
        if (newState !== TIMER_CANCELLED && newState !== TIMER_RUNNING && newState !== TIMER_COMPLETE) {
            throw new TypeError(`Invalid timer state: ${newState}!`)
        }

        this._state = newState
    }

    /**
     * A class representing a timer.
     *
     * @param length The length in seconds of the timer.
     * @param callback The callback function to run when the state is finalized.
     */
    constructor(length: number, private readonly callback?: TimerCallback) {
        this.state = TIMER_RUNNING

        new Promise((resolve) => {
            setTimeout(resolve, length * 1000)
        })
            .then(() => {
                if (this.state === TIMER_CANCELLED) {
                    callback?.(this.state)
                    return
                }

                this.state = TIMER_COMPLETE
                this.callback?.(this.state)
            })
            .catch(() => {
                // how did we get here? this should not be possible
                this.state = TIMER_CANCELLED
                this.callback?.(this.state)
            })
    }

    /**
     * Cancel execution of a timer early.
     */
    cancel(): void {
        if (this.state !== TIMER_RUNNING) {
            // ignore this call if the timer isn't running
            return
        }

        this.state = TIMER_CANCELLED
        this.callback?.(this.state)
    }
}

/**
 * A class for managing timers.
 */
export class TimerManager {
    /**
     * Note: please avoid accessing this directly.
     *
     * @see getTimer
     * @see setTimer
     * @see createTimer
     */
    timers: Map<string, Timer>

    constructor() {
        this.timers = new Map<string, Timer>()
    }

    /**
     * Get the timer associated with the specified path. May return undefined.
     *
     * @param path The timer's JSON path.
     * @returns The timer, or undefined.
     */
    getTimer(path: string): Timer | undefined {
        return this.timers.get(path)
    }

    /**
     * Set the timer associated with the specified path.
     *
     * @param path The timer's JSON path.
     * @param timer The timer.
     */
    setTimer(path: string, timer: Timer): void {
        this.timers.set(path, timer)
    }

    /**
     * Create a timer. Mainly meant for consumers who want to use a custom timer class.
     *
     * @param path The timer's JSON path.
     * @param length The timer's length in seconds.
     * @param callback Optional callback.
     * @returns The timer.
     */
    createTimer(path: string, length: number, callback?: TimerCallback): Timer {
        const t = new Timer(length, callback)
        this.timers.set(path, t)
        return t
    }
}
