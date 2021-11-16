# StateMachineParser

Check what an IOI state machine would return given an input.

## What's an IOI state machine?

An IOI state machine is what we call a part of the JSON scripting system used within the Glacier engine.

For example:

```json
{
    "$eq": ["$Value.MyParameter", "Hello"]
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
const { check } = require("@peacockproject/statemachine-parser")

const result = check(
    {}, // the state machine condition
    { $Value: {} }, // the globals object, which is essentially the input values.
)
```
