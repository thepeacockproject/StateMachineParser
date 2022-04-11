# Changelog

## v3.1.0

-   Handle immediately executing event handlers.
-   Enable enhanced tree shaking.

## v3.0.0

-   Basically rewrote the whole thing to be faster and smaller, and have fewer issues.
-   Handling side effect state machines and conditional state machines are now separate functions.
-   Many other improvements, such as properly shipped ES modules, less file duplication, and more.

## v2.1.0

-   `$pushunique` and `$push` nodes now use the same implementation.
-   Added tests for `$inc` and `$dec` (+ fixed associated bugs).
-   Excluded TypeScript build info files from release files.
-   Replaced our implementation of `setObjectChild` with Lodash's version.
-   Updated dependencies.

## v2.0.0

-   The statemachine conditions can no longer be null or undefined.
-   The globals can no longer be null or undefined.
-   Support side effect nodes (`$set`, `$mul`, `$inc`, `$dec`, `$div` all work properly now).
-   The `check` method now returns an object in the format of `{ bool: boolean, globals: any }`, because side effect nodes can modify the globals object.
-   `findObjectChild` (formerly `$referenceToData`) and `setObjectChild` are now exported.
-   Added inline JSDoc.

## v1.0.1

-   Same as v1.0.0 but re-published due to a bug.

## v1.0.0

-   First release.
