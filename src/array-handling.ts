import type { Options, RealTestFunc } from "./index"

/**
 * Function that creates an array-like test node parser.
 * It's split into a separate file for the sake of organization, and uses the proxy function to avoid circular dependencies.
 *
 * @param realTest The realTest function (internal).
 */
export function createArrayHandler(realTest: RealTestFunc) {
    return (input, variables, op: string, options: Options): boolean => {
        // find the array
        const array = realTest(input[op]["in"], variables, {
            ...options,
            _path: `${options._path}.${op}.in`,
        })

        const itemConditions = input[op]["?"]

        for (const item of array) {
            const test = realTest(itemConditions, variables, {
                ...options,
                findNamedChild(reference, variables) {
                    // a little future-proofing, as sometimes the $ is there, and other times it isn't.
                    // we strip it out somewhere, but it shouldn't matter too much.
                    if (reference === "$.#" || reference === ".#") {
                        return item
                    }

                    return options.findNamedChild(reference, variables)
                },
            })

            if (test && (op === "$inarray" || op === "$any")) {
                return true
            }

            if (!test && op === "$all") {
                return false
            }
        }

        // if this is an all request, each condition was met
        // otherwise, only some (or possibly none) worked
        return op === "$all"
    }
}
