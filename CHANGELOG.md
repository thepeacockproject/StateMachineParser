# Changelog

## v5.5.2

-   Fixed irregular events not being handled correctly.

## v5.5.1

-   Fixed contract IDs not being passed to conditions and transitions.

## v5.5.0

-   Added support for long arrays to the `$eq` operator.

## v5.4.0

-   Added support for contract IDs in `$pushunique`.

## v5.3.0

-   Fixed a bug which would cause timers to be persisted, preventing them from starting again.

## v5.2.0

NOTE: This release contains 2 potentially breaking changes.
They are in a semver-minor release because both align the parser more with the IOI behavior.

-   Added prepack script so building from source works properly.
-   *Breaking*: Fixed handleEvent resetting the context when an event is disregarded.
-   *Breaking*: Removed support for `$div`, as it never actually existed in the game.
-   Updated build dependencies.

## v5.1.0

-   Require a timestamp on all events (for timers). This is breaking, but needed to be done.

## v5.0.0

-   Removed debug in favor of a user-provided logging function.
-   Reworked timers to use a better system that is controlled by the library consumer.
-   Fixed the `$le` implementation.
-   Refactored type definitions a bit.

## v4.3.0

-   Fixed inconsistent getting and setting behavior as a result of the last patch.
-   Added new documentation, and improved existing documentation.
-   Renamed `$gte` and `$lte` to `$ge` and `$le` to be consistent with the usage of the game.

## v4.2.0

-   `$pushunique` can now be used as a condition.
-   `(`, `)`, and leading `$` (and `$.`) are now automatically removed from strings if resolved.

## v4.1.0

-   Added `Count` property to arrays.
-   Removed support for comparing arrays with `$eq`.

## v4.0.0

-   Added tracing functionality to assist with finding bugs.
-   Support `$remove` action.
-   Synchronized copyright headers.
-   `handleEvent` now automatically handles the immediately invoked event upon transitions.

## v3.3.0

-   Moved the build setup to esbuild.
-   Proper ES modules are now published that can be loaded by Node.js and the browser.
-   Added code coverage.
-   Handle nested array nodes.
-   Fixed a crash that could be caused by handling actions in `handleEvent`.
-   Added some new tests.

## v3.2.1

-   Fixed the actions not being executed correctly in `handleEvent`.
-   Fixed some outstanding issues with timers.

## v3.2.0

-   Remove `lodash`'s `set` implementation in favor of a smaller one.
-   Better handling in `handleEvent` for falsy values.

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
