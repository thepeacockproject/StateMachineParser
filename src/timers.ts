export const TIMER_COMPLETE = Symbol.for("StateMachineTimerComplete")
export const TIMER_CANCELLED = Symbol.for("StateMachineTimerCancelled")
export const TIMER_RUNNING = Symbol.for("StateMachineTimerRunning")
export type TimerStatus =
    | typeof TIMER_COMPLETE
    | typeof TIMER_CANCELLED
    | typeof TIMER_RUNNING

export class Timer {
    state: TimerStatus

    constructor(length: number) {
        this.state = TIMER_RUNNING

        new Promise((resolve) => {
            setTimeout(resolve, length * 1000)
        })
            .then(() => {
                this.state = TIMER_COMPLETE
            })
            .catch(() => {
                // how did we get here? this should not be possible
                this.state = TIMER_CANCELLED
            })
    }

    /**
     * Cancel execution of a timer early.
     */
    cancel(): void {
        this.state = TIMER_CANCELLED
    }
}

export class TimerManager<T extends Timer = Timer> {
    protected timers: Map<string, T>

    constructor() {
        this.timers = new Map<string, T>()
    }

    /**
     * Get the timer associated with the specified path. May return undefined.
     *
     * @param path The timer's JSON path.
     * @returns The timer, or undefined.
     */
    getTimer(path: string): T | undefined {
        return this.timers.get(path)
    }

    /**
     * Set the timer associated with the specified path.
     *
     * @param path The timer's JSON path.
     * @param timer The timer.
     */
    setTimer(path: string, timer: T): void {
        this.timers.set(path, timer)
    }

    /**
     * Create a timer. Mainly meant for consumers who want to use a custom timer class.
     *
     * @param path The timer's JSON path.
     * @param length The timer's length in seconds.
     * @returns The timer.
     */
    createTimer(path: string, length: number): T {
        const t = <T>new Timer(length)
        this.timers.set(path, t)
        return t
    }
}
