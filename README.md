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

### Install from npm

You can run:

```shell
yarn add @peacockproject/statemachine-parser
```

Or, if you use npm:

```shell
npm i @peacockproject/statemachine-parser
```

### Build from Source

```shell
git clone https://github.com/thepeacockproject/StateMachineParser
cd StateMachineParser
# installs dependencies and builds
yarn && yarn build
```

## Usage

```js
const { check } = require("@peacockproject/statemachine-parser")

const result = check(
    { $eq: [true, true] }, // the state machine condition
    { $Value: {} } // the globals object, which is essentially the input values.
).bool
```
