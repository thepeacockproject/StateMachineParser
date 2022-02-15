/**
 *    Copyright 2022 The Peacock Project
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

import { test } from "./index.js"

/**
 * Options that are passed to {@link handleEvent}.
 */
export interface HandleEventOptions {
    eventName: string
    currentState?: string
}

/**
 * Data returned from {@link handleEvent}.
 * Context is a generic, so it can be typed by library consumers.
 */
export interface HandleEventReturn<Context> {
    state: string
    context: Context
}

interface State {
    Condition?: unknown
    Actions?: unknown | unknown[]
    Transition?: string
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
            [eventName: string]: State
        }
    }
}

/**
 * This function simulates an event happening, as if in game.
 * Given a state machine definition, the event, and a few other things, you can inspect the results.
 *
 * @param definition The state machine definition.
 * @param event The event object.
 * @param options Various other settings and details needed for the implementation.
 * @returns The state machine and related data after performing the operation.
 */
export function handleEvent<Context = unknown>(
    definition: StateMachineLike<Context>,
    event: unknown,
    options: HandleEventOptions
): HandleEventReturn<Context> {
    const { eventName, currentState = "Start" } = options

    if (
        !definition.States?.[currentState] ||
        !definition.States?.[currentState]?.[eventName]
    ) {
        // we are here because either:
        // - we have no handler for the current state
        // - in this particular state, the state machine doesn't care about the current event
        return {
            context: definition.Context,
            state: currentState,
        }
    }

    // do we need to check conditions?
    const shouldCheckConditions =
        !!definition.States[currentState][eventName].Condition

    // does the event handler have any keys that look like actions?
    // IOI sometimes puts the actions along-side keys like Transition and Condition,
    // yet both still apply
    const irregularEventKeys = Object.keys(
        definition.States[currentState][eventName]
    ).filter((k) => k.includes("$"))
    const hasIrregularEventKeys = irregularEventKeys.length > 0

    // do we need to perform actions?
    const shouldPerformActions =
        !!definition.States[currentState][eventName].Actions ||
        hasIrregularEventKeys

    // do we need to perform a transition?
    const shouldPerformTransition =
        !!definition.States[currentState][eventName].Transition

    const constantKeys = Object.keys(definition.Constants ?? {})

    let conditionResult = true

    if (shouldCheckConditions) {
        conditionResult = test(
            definition.States[currentState][eventName].Condition,
            {
                Value: event,
                ...(definition.Context ?? {}),
                ...(definition.Constants ?? {}),
            }
        )
    }

    let newContext = definition.Context

    if (conditionResult && shouldPerformActions) {
        let Actions = definition.States[currentState][eventName].Actions ?? []

        if (!Array.isArray(Actions)) {
            Actions = [Actions]
        }

        if (hasIrregularEventKeys) {
            ;(<unknown[]>Actions).push(
                ...irregularEventKeys.map(
                    (key) => definition.States[currentState][eventName][key]
                )
            )
        }

        for (const actionSet of Actions as unknown[]) {
            for (const action of Object.keys(actionSet)) {
                newContext = test(
                    definition.States[currentState][eventName].Condition,
                    {
                        Value: event,
                        ...newContext,
                    }
                ).globals
            }
        }

        // drop this specific event's value
        // @ts-expect-error not defined
        if (newContext.Value) {
            // @ts-expect-error not defined
            delete newContext.Value
        }

        // drop the constants
        for (const constantKey of constantKeys) {
            delete newContext[constantKey]
        }
    }

    let state = currentState

    if (conditionResult && shouldPerformTransition) {
        state = definition.States[currentState][eventName].Transition
    }

    return {
        context: newContext,
        state,
    }
}
