# StateMachineParser

Check what an IOI state machine would return given an input.

## What's an IOI state machine?

An IOI state machine is what we call a part of the JSON scripting system used within the Glacier engine.

For example:

```json
{
    "$eq": [
        "$Value.MyParameter",
        "Hello"
    ]
}
```

That is a state machine condition that checks if `$Value.MyParameter` is `"Hello"`.

Normally, only the actual Glacier engine could check the output of this condition, but this parser can also do it.

## How to Use

Right now, the package isn't published on npm, so you need to install from source.

If you use yarn v2 or v3:

```shell
yarn add @peacockproject/statemachine-parser@thepeacockproject/StateMachineParser
```

Or, if you use something else:

```shell
git clone https://github.com/thepeacockproject/StateMachineParser
cd StateMachineParser
# installs dependencies and builds
yarn
```

then you can add the files from the `build` folder to your project manually.

## Usage

```js
const { StateMachine } = require("@peacockproject/statemachine-parser")

const s = new StateMachine(
    {} // the condition is the only param that the constructor should be given. it is required!
)

s.check(
    { $Value: {} }
) // the check method accepts the globals object, which is essentially the input values.

// this specific example wouldn't work, because `{}` isn't a valid state machine.
```
