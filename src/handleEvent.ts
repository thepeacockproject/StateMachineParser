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

import { handleActions, test, TimerManager } from "./index"
import debug from "debug"

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

interface InStateEventHandler {
    Condition?: unknown | unknown[]
    Actions?: unknown | unknown[]
    Transition?: string
    [additionalActions: string]: unknown
}

/**
 * A state machine, in a minimal form.
 * Context and Constants are generic, so they can be typed by library consumers.
 */
interface StateMachineLike<Context, Constants = undefined> {
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
 * This function simulates an event happening, as if in game.
 * Given a state machine definition, the event, and a few other things, you can inspect the results.
 *
 * @param definition The state machine definition.
 * @param context The current context of the state machine.
 * @param event The event object.
 * @param options Various other settings and details needed for the implementation.
 * @returns The state machine and related data after performing the operation.
 */
export function handleEvent<Context = unknown, Event = unknown>(
    definition: StateMachineLike<Partial<Context>>,
    context: Partial<Context>,
    event: Event,
    options: HandleEventOptions
): HandleEventReturn<Partial<Context>> {
    const trace = debug("smparser:handleEvent")
    const { eventName, currentState = "Start" } = options

    // (current state object - reduces code duplication)
    let csObject = definition.States?.[currentState]

    if (
        !csObject ||
        (!csObject?.[eventName] && !csObject?.$timer)
    ) {
        trace(`SM in state ${currentState} disregarding ${eventName}`)
        // we are here because either:
        // - we have no handler for the current state
        // - in this particular state, the state machine doesn't care about the current event
        return {
            context: definition.Context,
            state: currentState,
        }
    }

    const hasTimerState = !!csObject.$timer && !!options?.timerManager

    // ensure no circular references are present, and that this won't update the param by accident
    let newContext = JSON.parse(JSON.stringify(context))

    const doEventHandler = (handler: InStateEventHandler) => {
        // do we need to check conditions?
        const shouldCheckConditions = !!handler.Condition

        // does the event handler have any keys that look like actions?
        // IOI sometimes puts the actions along-side keys like Transition and Condition,
        // yet both still apply
        const irregularEventKeys = Object.keys(handler).filter((k) =>
            k.includes("$")
        )
        const hasIrregularEventKeys = irregularEventKeys.length > 0

        // do we need to perform actions?
        const shouldPerformActions = !!handler.Actions || hasIrregularEventKeys

        // do we need to perform a transition?
        const shouldPerformTransition = !!handler.Transition

        const constantKeys = Object.keys(definition.Constants || {})

        let conditionResult = true

        if (shouldCheckConditions) {
            conditionResult = test(handler.Condition, {
                Value: event,
                ...(context || {}),
                ...(definition.Constants || {}),
            })
        }

        if (conditionResult && shouldPerformActions) {
            let Actions = handler.Actions || []

            if (!Array.isArray(Actions)) {
                Actions = [Actions]
            }

            if (hasIrregularEventKeys) {
                ;(<unknown[]>Actions).push(
                    ...irregularEventKeys.map((key) => handler[key])
                )
            }

            for (const actionSet of Actions as unknown[]) {
                for (const action of Object.keys(actionSet)) {
                    newContext = handleActions(
                        {
                            [action]: actionSet[action],
                        },
                        {
                            Value: event,
                            ...newContext,
                        }
                    )
                }
            }

            // drop this specific event's value
            if (newContext.Value) {
                delete newContext.Value
            }

            // drop the constants
            for (const constantKey of constantKeys) {
                delete newContext[constantKey]
            }
        }

        let state = currentState

        if (conditionResult && shouldPerformTransition) {
            state = handler.Transition

            trace(`${currentState} is performing a transition to ${state} - running it's "-" event`)

            return handleEvent(definition, newContext, {}, {
                eventName: "-",
                currentState: state,
            })
        }

        return {
            context: newContext,
            state,
        }
    }

    let eventHandlers = csObject[eventName]

    if (!Array.isArray(eventHandlers)) {
        // if we don't have a handler for the current event, but we do for the timer, it produces [undefined]
        eventHandlers = [eventHandlers].filter(Boolean)
    }

    type EHArray = InStateEventHandler[]

    //#region timers and immediate states

    if (hasTimerState) {
        const timerState = csObject.$timer

        if (Array.isArray(timerState)) {
            ;(eventHandlers as EHArray).push(...timerState)
        } else {
            ;(eventHandlers as EHArray).push(timerState)
        }
    }

    //#endregion

    for (const handler of eventHandlers) {
        const out = doEventHandler(handler)

        newContext = out.context

        if (out.state !== currentState) {
            // we swapped states while in a handler, so our work here is done
            return {
                context: newContext,
                state: out.state,
            }
        }
    }

    return {
        state: currentState,
        context: newContext,
    }
}
