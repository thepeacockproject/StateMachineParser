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

import { TIMER_CANCELLED, TIMER_COMPLETE, TIMER_RUNNING, TimerManager } from "./timers"
import { findNamedChild } from "./utils"

/**
 * Options that are passed to {@link handleEvent}.
 */
export interface HandleEventOptions {
    eventName: string
    currentState?: string
    timerManager?: TimerManager
}

/**
 * Data returned from {@link handleEvent}.
 * Context is a generic, so it can be typed by library consumers.
 */
export interface HandleEventReturn<Context> {
    state: string
    context: Context
}

/**
 * @internal
 */
export interface InStateEventHandler {
    Condition?: unknown | unknown[]
    Actions?: unknown | unknown[]
    Transition?: string
    [additionalActions: string]: unknown
}

/**
 * A state machine, in a minimal form.
 * Context and Constants are generic, so they can be typed by library consumers.
 */
export interface StateMachineLike<Context, Constants = any | undefined> {
    /**
     * The globals.
     */
    Context?: Context
    /**
     * Context listeners.
     */
    ContextListeners?: unknown
    /**
     * The constants, which is used by certain state machines like sniper scoring.
     */
    Constants?: Constants
    /**
     * We may need this in the future.
     */
    Scope?: string
    /**
     * Mapping of state name to mapping of event name to handler.
     */
    States: {
        [stateName: string]: {
            [eventName: string]: InStateEventHandler | InStateEventHandler[]
            $timer?: InStateEventHandler | InStateEventHandler[]
            ["-"]?: InStateEventHandler | InStateEventHandler[]
        }
    }
}

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

/**
 * @internal
 */
export type FindNamedChildFunc = typeof findNamedChild

export interface TestOptions {
    /**
     * The findNamedChild function that should be used for resolution of
     * variables.
     */
    findNamedChild: FindNamedChildFunc

    /**
     * How many nested loop nodes we are currently in - used to determine what
     * the value of the current iterator should point to.
     */
    _currentLoopDepth?: number

    /**
     * The path to the current value in the current object, for interactive
     * debugger stepping and tracing.
     */
    _path?: string

    /**
     * The timer manager instance. If not defined, timers will never be started,
     * and will always return false.
     */
    timerManager?: TimerManager

    /**
     * The function called when a push-unique instruction occurs in a test case.
     * Consumer-specified for backwards compatibility.
     *
     * @param reference A pointer to the array.
     * @param value The value to try to push.
     * @returns True if the value was pushed, false if it was not.
     */
    pushUniqueAction?: (reference: string, value: any) => boolean
}
