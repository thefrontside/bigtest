# @bigtest/cli [![CircleCI](https://circleci.com/gh/bigtestjs/cli/tree/master.svg?style=svg)](https://circleci.com/gh/bigtestjs/cli/tree/master)

## WIP

_Under **heavy** development_

1. Run `npm link` to globally link this package to the `bigtest` command.
2. Run `yarn start` to watch and rebuild the CLI when changes are made.

### `bigtest run`

1. Change your bundler's entry to point to your tests
``` javascript
// `bigtest run` sets NODE_ENV to "test" automatically
let isTesting = process.env.NODE_ENV === 'test'

// if your bundler supports multiple entry points, you can include all
// of your tests using a glob pattern (see node-glob)
entry: isTesting ? glob.sync('tests/*-test.js') : 'src/index.js',

// if your bundler does not support multiple entry points, you can
// point to an index file where you import each test
```

2. Tell BigTest how to serve your app (`--serve-url` defaults to
`http://localhost:3000`) and specify an adapter to use (`mocha` is
currently the only supported adapter).
``` bash
$ bigtest run \
  --serve "yarn webpack-serve" \
  --serve-url "http://localhost:8080" \
  --adapter mocha
```

2 **Alt**: BigTest can also accept an `.opts` file, which it will look for
by default at `bigtest/bitest.opts`.

``` bash
# bigtest/bigtest.opts
--serve "yarn webpack-serve"
--serve-url "http://localhost:8080"
--adapter mocha
```

``` bash
$ bigtest run
# OR
$ bigtest run --opts path/to/file.opts
```
