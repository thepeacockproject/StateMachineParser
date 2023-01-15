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
-   [Common Nodes](#common-nodes)
    -   [`$pushunique`](#pushunique)

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

### `$inarray`, `$any`

Documentation not yet done here. Feel free to open a PR!

### `$all`

Documentation not yet done here. Feel free to open a PR!

### `$contains`

Documentation not yet done here. Feel free to open a PR!

## Action Nodes

Side effect nodes are nodes that are only supposed to be used inside `Actions` definitions, as they have side effects (e.g. modifying the globals).

### `$inc`, `$dec`

This node increments or decrements a context variable. It's exact behavior depends how it's arguments are given.

- If a string is given, it will increment or decrement the context variable with that name.
- If an array is given, the first element will be the context variable pointer, and the second element will either be the number to increment or decrement by or a pointer to a value of that number.

### `$mul`

Documentation not yet done here. Feel free to open a PR!

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

### `$push`

Documentation not yet done here. Feel free to open a PR!

## Common Nodes

These nodes can be used as both conditions and actions.

### `$pushunique`

> **Warning**: This node is the only one that is both a condition and an action.

Documentation not yet done here. Feel free to open a PR!
