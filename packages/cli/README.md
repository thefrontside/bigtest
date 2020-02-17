# @bigtest/cli

``` shell
$ bigtest [all] [the] [ things]
```

## Synopsis

``` shell
$ bigtest --help
```

## Development

To run commands during development, you can use the `yarn start`
followed by any arguments:

``` shell
$ yarn start server --agent-server http://localhost:2400
```

would be equivalent to running:

``` shell
$ bigtest server --gent-server http://localhost:2400
```

with a version deployed from NPM

#### Tests

To run the tests:

``` sh
$ yarn test
```
