# @bigtest/eslint-plugin

## Installation

```bash
yarn add --dev eslint @bigtest/eslint-plugin
```

## Configuration

Create an `.eslintrc.json` or `.eslintrc.js` in your bigtest test directory, e.g. `./test` and populate it with the following:

```json
{
  "extends": ["plugin:@bigtest/recommended"],
  "plugins": [ "@bigtest" ]
}
```

## Rules

<!-- begin rules list -->

| Rule                                                                         | Description                                                     | Configurations   | Fixable      |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------- | ------------ |
| [@bigtest/require-default-export](docs/rules/require-default-export)                       | Each test file must have a default export. 
