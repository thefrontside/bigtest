# @bigtest/eslint-plugin

## Installation

```bash
yarn add --dev eslint @bigtest/eslint-plugin
```

## Usage

Add `@bigtest` to the plugins section of your `.eslintrc` configuration file.
```json
{
  "plugins": ["@bigtest"]
}
```

## Shareable configurations

### Recommended

This plugin exports a recommended configuration.

To enable this configuration use the `extends` property in your `.eslintrc`
config file:

```json
{
  "extends": ["plugin:@bigtest/recommended"]
}
```

## Rules

<!-- begin rules list -->

| Rule                                                                         | Description                                                     | Configurations   | Fixable      |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------- | ------------ |
| [require-default-export](docs/rules/require-default-test-export)                       | Each test file must have a default export. 
