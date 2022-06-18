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

/** A unique identifier indicating that a timer has successfully finished. */
export const TIMER_COMPLETE = Symbol.for("StateMachineTimerComplete")
/** A unique identifier indicating that a timer has been cancelled before it was able to finish. */
export const TIMER_CANCELLED = Symbol.for("StateMachineTimerCancelled")
/** A unique identifier indicating that a timer is currently running. */
export const TIMER_RUNNING = Symbol.for("StateMachineTimerRunning")
/** The status of a timer. */
export type TimerStatus =
    | typeof TIMER_COMPLETE
    | typeof TIMER_CANCELLED
    | typeof TIMER_RUNNING

/** A timer. */
export interface Timer {
    /** The start timestamp. */
    start: number
    /** The end timestamp. */
    end: number
    /** The status. */
    status: TimerStatus
}

/**
 * A class for managing timers.
 */
export class TimerManager {
    /**
     * Note: please avoid accessing this directly.
     *
     * @see getTimer
     * @see createTimer
     */
    protected timers: Map<string, Timer>

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
     * Get a list of all the timer paths registered with this timer manager.
     */
    get allRegisteredTimerPaths(): string[] {
        return Array.from(this.timers.keys())
    }

    /**
     * Create a timer. Mainly meant for consumers who want to use a custom timer class.
     *
     * @param path The timer's JSON path.
     * @param length The timer's length in seconds.
     * @param startTimestamp The timer's starting timestamp.
     * @returns The timer.
     */
    createTimer(path: string, length: number, startTimestamp: number): Timer {
        const t: Timer = {
            start: startTimestamp,
            end: startTimestamp + (length * 1000),
            status: TIMER_RUNNING,
        }
        this.timers.set(path, t)
        return t
    }
}
