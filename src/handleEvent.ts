import { check } from "./index.js"

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
 * Context is a generic, so it can be typed by library consumers.
 */
interface StateMachineLike<Context> {
    /**
     * The globals.
     */
    Context?: Context
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

    // do we need to perform actions?
    const shouldPerformActions =
        !!definition.States[currentState][eventName].Actions

    // do we need to perform actions?
    const shouldPerformTransition =
        !!definition.States[currentState][eventName].Transition

    let conditionResult = true

    if (shouldCheckConditions) {
        conditionResult = check<Context>(
            definition.States[currentState][eventName].Condition,
            {
                $Value: event,
                ...definition.Context,
            }
        ).bool
    }

    let newContext = definition.Context

    if (conditionResult && shouldPerformActions) {
        newContext = check<Context>(
            definition.States[currentState][eventName].Actions,
            newContext
        ).globals
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
