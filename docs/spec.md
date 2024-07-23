# Unofficial State Machine Specification

This is a list of the possible nodes that can appear in a state machine, and what they do, from the research we have done so far.

## Table of Contents

-   [Conditional Nodes](#conditional-nodes)
    -   [`$eq`](#eq)
    -   [`$and`](#and)
    -   [`$or`](#or)
    -   [`$not`](#not)
    -   [`$after`](#after)
    -   [`$inarray` and `$any`](#inarray-any)
    -   [`$all`](#all)
    -   [`$contains`](#contains)
-   [Action Nodes](#action-nodes)
    -   [`$inc` and `$dec`](#inc-dec)
    -   [`$mul`](#mul)
    -   [`$push`](#push)
    -   [`$reset`](#reset)
-   [Common Nodes](#common-nodes)
    -   [`$pushunique`](#pushunique)
-   [Nesting Array Nodes](#nesting-array-nodes)

## Conditional Nodes

These nodes all return boolean values, which represent if the checks inside these nodes pass or fail.

### `$eq`

This node checks if the child elements are equal to each other.

This node accepts an array of 2 items, which will be checked for equality.

This node returns true if the 2 items are equal to each other.

> Implementation Note: Arrays will not equal each other (starting in v4.1.0).

Example:

```json5
{
    $eq: [true, true], // -> true
}
```

```json5
{
    $eq: [5, 6], // -> false, 5 is not 6
}
```

### `$and`

This node checks if the child elements are all true.

This node accepts an array of 2 or more items, which will all be evaluated for their truthiness.

This node returns true if all child elements evaluate to true.

Example:

```json5
{
    $and: [
        {
            $eq: [40, 40],
        }, // -> true
        {
            $eq: ["hello world", "hello world"],
        }, // -> true
    ], // -> true
}
```

```json5
{
    $and: [
        {
            $eq: [40, 50],
        }, // -> false
        {
            $eq: ["hello world", "hello world"],
        }, // -> true
    ], // -> false
}
```

### `$or`

This node is a version of the `$and` node that only checks if one of the children evaluates to true.

Example:

```json5
{
    $or: [true, false], // -> true
}
```

```json5
{
    $or: [
        {
            $eq: ["chicken", "steak"],
        }, // -> false
        false,
    ], // -> false
}
```

### `$not`

This node returns true if the child element is false.

It accepts the child object as its value.

Example:

```json5
{
    $not: {
        $eq: ["lettuce", "tomato"], // -> false
    }, // -> true
}
```

### `$after`

This node is indented for delaying a state machine's evaluation by a number of seconds.

> Implementation Note: This node is very loosely implemented, and will be rewritten in the near future.

It accepts a parameter `seconds`, which should be a number value indicating after how many seconds the node evaluates to `true`.

Example:

```json5
{
    $after: 5,
}
 // -> return `true` after 5 seconds
```

### `$inarray`, `$any`

These two nodes are aliases of each other, and check if at least one element in an array pass the given condition.

Parameters:

-   `in` - A pointer to, or the literal value of the array to be checked.
-   `?` - The condition to test against each array value.

Example:

```json5
// check if any element in the context object is equal to the given value
{
    Targets: ["Tony"]
}

[
    {
        $any: {
            in: "$.Targets",
            ?: {
                $eq: [
                    "$.#",
                    "Tony"
                ]
            }
        } // -> true
    },
    {
        $any: {
            in: "$.Targets",
            ?: {
                $eq: [
                    "$.#",
                    "John"
                ]
            }
        } // -> false
    }
]
```

Example:

```json5
{
    $any: {
        ?: {
            $any: {
                ?: {
                    $eq: ["$.#", "$.##"]
                },
                in: ["apple", "pear"]
            }
        }
        in: ["apple", "banana"]
    } // -> true, "apple" satisfies both two conditions
}
```

### `$all`

This node checks if all elements in an array, evaluated by the condition, return true.

Parameters:

-   `in` - A pointer to, or the literal value of the array to be checked.
-   `?` - The condition to test against each array value.

Example:

```json5
// check if any element in the context object is equal to the given value
[
    {
        $all: {
            in: ["Tony", "Tony"],
            ?: {
                $eq: [
                    "$.#",
                    "Tony"
                ]
            }
        } // -> true
    },
    {
        $all: {
            in: ["Tony", "John"],
            ?: {
                $eq: [
                    "$.#",
                    "Tony"
                ]
            }
        } // -> false
    }
]
```

### `$contains`

This node can check whether the given two arguments are string-typed and whether the first string contains the content of the second string.

Example:

```json5
{
    $contains: [true, true] // -> false, because they are not both string-typed
},
{
    $contains: ["hokkaido_flu", "hokkaido"] // -> true
},
{
    $contains: ["colombia", "colombia_anaconda"] // -> false
}
```

## Action Nodes

Side effect nodes are nodes that are only supposed to be used inside `Actions` definitions, as they have side effects (e.g. modifying the globals).

### `$inc`, `$dec`

This node increments or decrements a context variable. It's exact behavior depends how it's arguments are given.

-   If a string is given, it will increment or decrement the context variable with that name by 1.
-   If an array is given, the first element will be the context variable pointer, and the second element will either be the number to increment or decrement by or a pointer to a value of that number.

Examples:

```json5
{
    $inc: "myVar", // -> myVar++
}
```

```json5
{
    $inc: ["myVar", 5], // -> myVar += 5
}
```

```json5
{
    $inc: ["myVar", "myOtherVar"], // -> myVar += valueOf(myOtherVar)
}
```

### `$mul`

This node executes a multiplication given two or three context variables (whose values must be numeric) with a double purpose:

-   If given 2 parameters, it assign the product to the first argument;
-   If given 3 parameters, it let the first and second arguments be multiplied and assign the product to the third argument.

Example:

```json5
{
    $mul: ["myVar", "myOtherVar"] // -> myVar *= myOtherVar
}

{
    $mul: ["myVar1", "myVar2", "myVar"] // -> myVar = myVar1 * myVar2
}
```

### `$set`

This node sets the value of a context object to another value.

The node itself is given an array as a parameter.
The array may only have 2 items, the first being the reference to the context object to set the value of, and the second being the new value.

Example:

```json5
{
    // sets the value of `CoolestCharacter` to "Rocco"
    $set: ["$CoolestCharacter", "Rocco"],
}
```

### `$reset`

This node sets the value of a context variable to the original value retrieved from the definition.

The node itself is given the name of the variable.

Example:

```json5
// Starting context from definition
{
    Targets: ["Tony"]
}
{
    // Some actions may have preceded transforming the array i.e. $push
    // This will reset the "Targets" array to ["Tony"]
    $reset: "Targets"
}
```

### `$push`

Like `$pushunique` (see below), the `$push` node also adds an element to a targeted array. The difference is that `$push` doesn't care if the element is already in the array before the action, which can cause duplicated elements.

Example:

```json5
// Starting context from definition
{
    Targets: ["Tony"]
}

[
    {
        Actions: {
            $push: [
                "Targets",
                "John"
            ] // -> `Targets` array now has two elements: "Tony", "John"
        }
    },
    {
        Actions: {
            $push: [
                "Targets",
                "Tony"
            ] // -> `Targets` array now has three elements: "Tony", "John", "Tony"
        }
    }
]
```

## Common Nodes

These nodes can be used as both conditions and actions.

### `$pushunique`

> **Warning**: This node is the only one that is both a condition and an action.

`$pushunique` is a node with a double purpose:

-   As an action, it adds the element to the array if it's not already present.
-   As a condition, it checks if an element is already in an array.
    -   If the condition is true, it performs the action after finishing the evaluation of the condition.

It should contain two elements:

-   `reference` - An array in which you try to push element.
-   `item` - The element you try to add.

For _action_ use, this will try to push the `item` to `reference`. Here's an example:

```json5
// Starting context from definition
{
    Targets: ["Tony"]
}

[
    {
        Actions: {
            $pushunique: [
                "Targets",
                "John"
            ] // -> `Targets` array now contains two elements: "Tony", "John"
        }
    },
    {
        Actions: {
            $pushunique: [
                "Targets",
                "Tony"
            ] // -> `Targets` array now contains two elements: "Tony", "John"
        }
    },
    {
        Actions: {
            $pushunique: [
                "TargetsPending",
                "Tony"
            ] // -> Error: Could not find "TargetsPending" in context
        }
    }
]
```

For _condition_ use, it still tries to push `item` to `reference`, but returns a boolean value which is determined by whether the action is executed or not. Here's an example:

```json5
// Starting context from definition
{
    Targets: ["Tony"]
}

[
    {
        Condition: {
            $pushunique: [
                "Targets",
                "Tony"
            ] // -> false, because the element "Tony" had already been there
        }
    },
    {
        Condition:{
            $pushunique: [
                "Targets",
                "John"
            ] // -> true, and "John" will now be in the array
        }
    }
]
```

## Special Snowflakes

Other things that work but are unused or overcomplicated.

### `$select`

> [!CAUTION] > `$select` works in H3 (and maybe older versions, untested thus far), however it isn't used anywhere by the game, and this library does not support it due to it's complexity.

`$select` is a node that essentially acts as a for-each loop on an array that runs a specific action when met with true.
It can only be used as an action.

Parameters:

-   `in` - A pointer to, or the literal value of the array to be checked.
-   `?` - The condition to test against each array value.
-   `!` - The action to perform on matching values.

Example:

```json5
// for each number in the `input` context object that is equal to 1, add 5 to the counter
{
    $select: {
        in: "$.input",
        "?": {
            $eq: ["$.#", 1],
        },
        "!": [
            {
                $inc: ["counter", 5],
            },
        ],
    },
}
```

## Nesting Array Nodes

Sometimes, performing multiple levels of recursion at once is needed with one of the array nodes (`$inarray`/`$any` or `$all`).
If this is the case, it is possible to nest them. In a single-layer array, the `$.#` context variable is set to the current item being iterated over.
For each nested loop (each layer down you go), you add an extra `#` to the end to get that loop's current value.
So if you have a two-layer array, the outer current item will be `$.#`, and the inner current item will be `$.##`.

Here's an example:

Say you're writing a state machine where you want to ensure that multiple targets are killed with poison.
You _could_ write something along the lines of:

```json5
{
    $and: [
        // pretend these are fully filled out
        $eq: {}, // target 1 was killed with poison
        $eq: {}, // target 2 was killed with poison
    ]
}
```

But that's inefficient. You're just copying and pasting the condition, and making it more difficult to change!
Let's instead rewrite it with a nested loop:

```json5
// For this example, assume we have 2 arrays in the context:
// Targets - a list of the targets we're checking for this objective
// PoisonKills - a list of target IDs that have been killed with poison

{
    // this is the outer loop, which checks each target. this means that
    $all: {
        // Targets would be a context variable like `["target-1-repo-id", "target-2-repo-id"]`
        in: "$.Targets",
        ?: {
            // this is the inner loop (layer 2), where we check if a given target (from the outer loop) equals one of the items in the inner loop's array
            // (so, if any target in the outer loop matches one of the targets in the PoisonKills array)
            $inarray: {
                in: "$.PoisonKills",
                ?: {
                    $eq: [
                        // the current value of the outer loop's iteration (current target in `Targets`)
                        "$.#",
                        // the current value of the inner loop's iteration (current target in `PoisonKills`)
                        "$.##"
                    ]
                }
            }
        }
    }
}
```
