## Mirage Server

A client-side server to develop, test and prototype your app.

This project is a plain vanilla javascript extraction of the
[ember-cli-mirage][1] project. It can be used inside of any framework,
including React. The goal is for it to be eventually used upstream
by Ember mirage proper.

## Usage

``` javascript
import Mirage, { Factory } from '@bigtest/mirage';

let server = new Mirage({
  environment: 'test',
  factories: {
    address: Factory
  }
});

// do some stuff with the server.

// stop intercepting requests
server.shutdown()
```

## Development

Test suite is running in QUnit and Karma.

```
$ yarn
$ yarn start // karma server
$ yarn test // single run
```

[1]: http://www.ember-cli-mirage.com/
