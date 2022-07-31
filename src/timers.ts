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

import type { TimerCallback, TimerStatus } from "./types"

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

export class Timer {
    private _state: TimerStatus
    private readonly _timer: NodeJS.Timer

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
        if (
            newState !== TIMER_CANCELLED &&
            newState !== TIMER_RUNNING &&
            newState !== TIMER_COMPLETE
        ) {
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

        this._timer = setInterval(() => {
            if (this.state === TIMER_CANCELLED) {
                // this should not be possible, but just in case
                return
            }

            this.state = TIMER_COMPLETE
            clearInterval(this._timer)
            this.callback?.(this.state)
        }, length * 1000)
    }

    /**
     * Cancel execution of a timer early.
     */
    cancel(): void {
        if (this.state !== TIMER_RUNNING) {
            // ignore this call if the timer isn't running
            return
        }

        clearInterval(this._timer)
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
