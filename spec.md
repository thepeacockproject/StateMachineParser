# Unofficial State Machine Specification

This is a list of the possible nodes that can appear in a state machine, and what they do, from the research we have done so far.

## Generic Nodes

These nodes all return boolean values, which represent if the checks inside these nodes pass or fail.

### `$eq`

This node checks if the child elements are equal to each other.

This node accepts an array of 2 items, which will be checked for equality.

This node returns true if the 2 items are equal to each other.

> Implementation Note: We have made sure that JavaScript arrays with identical contents will equal each other.

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

> Implementation Note: We always return true, instead of actually timing anything.

### `$inarray`

Documentation not yet done here. Feel free to open a PR!

## Side Effect Nodes

Side effect nodes are nodes that are only supposed to be used inside `Actions` definitions, as they have side effects (e.g. modifying the globals).

### `$inc`, `$dec`

Documentation not yet done here. Feel free to open a PR!

### `$mul`, `$div`

Documentation not yet done here. Feel free to open a PR!

### `$set`

Documentation not yet done here. Feel free to open a PR!
