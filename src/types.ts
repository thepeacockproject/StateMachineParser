/*
 *    Copyright (c) 2022-2024 The Peacock Project
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

import { findNamedChild } from "./utils"

/**
 * A game timestamp is a number of seconds (with milliseconds as decimals) since the start of a contract.
 */
export type GameTimestamp = number

/**
 * The context for a running timer.
 */
export type Timer = {
    /**
     * The event timestamp at which this timer started.
     */
    startTime: GameTimestamp
    /**
     * The event timestamp at which this timer is scheduled to end.
     */
    endTime: GameTimestamp
    /**
     * The path to this timer.
     */
    path: string
}

/**
 * Options that are passed to {@link handleEvent}.
 */
export interface HandleEventOptions {
    /**
     * The event's name.
     */
    eventName: string

    /**
     * The current state of the state machine.
     */
    currentState?: string

    /**
     * All the timers that are currently active.
     */
    timers?: Timer[]

    /**
     * The time the event happened at.
     */
    timestamp: GameTimestamp

    /**
     * The contractId of the session the event took place in.
     * @since v5.4.0
     */
    contractId?: string
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
 * CAT - condition, actions, transition.
 */
export type CATObject = {
    Condition?: unknown | unknown[]
    Actions?: unknown | unknown[]
    Transition?: string
    [additionalActions: string]: unknown
}

/**
 * A state machine, in a minimal form.
 * Context and Constants are generic, so they can be typed by library consumers.
 */
export interface StateMachineLike<Context, Constants = any> {
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
    States: {
        [stateName: string]: {
            /**
             * If eventName starts with $, it will be run before any other handlers.
             */
            [eventName: string]: CATObject | CATObject[]
            /**
             * Special: run on every event.
             */
            ["-"]?: CATObject | CATObject[]
        }
    }
}

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
    _currentLoopDepth: number

    /**
     * The path to the current value in the current object, for interactive
     * debugger stepping and tracing.
     */
    _path: string

    /**
     * If applicable, the timestamp that the event occurred at.
     */
    eventTimestamp?: number

    /**
     * All the timers that are currently active.
     */
    timers?: Timer[]

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

/**
 * Options for {@link handleEvent}.
 */
export interface HandleActionsOptions {
    /**
     * The original context, this value is retrieved from
     * the definition, and used with the $reset op.
     *
     * @since v5.6.0
     */
    originalContext?: unknown
}
