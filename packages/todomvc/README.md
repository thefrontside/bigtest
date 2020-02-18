# @bigtest/todomvc

Quickly run TodoMVC apps from different frameworks

## Synopsis

The TodoMVC app is the standard application of decent complexity for
demonstrating the capabilities of various application frameworks. It
is also the application that we use as a control group for BigTest
itself.

This provides an npm installable TodoMVC app that can be used as a
stand-in for an actual project anywhere that we need it, including the
@bigtest/server test suite itself. Currently, it only supports a React
version, but will support other framework versions in the future.

To use it, add it to your `package.json`:

``` shell
$ yarn add -D @bigtest/todomvc
```

You can now start the todo mvc app by invoking the `bigtest-todomvc`
command.

``` shell
$ yarn bigtest-todomvc
serving TodoMVC application
--> http://localhost:53202
```

Optionally, it accepts a port number

``` shell
$ yarn bigtest-todomvc 5500
serving TodoMVC application
--> http://localhost:5500
```

To create a TodoMVC application from code:

``` typescript
import { TodoMVC } from '@bigtest/todomvc';

function *start() {
  let server: TodoMVC = yield TodoMVC.react(5500);

  console.log('server listening at ', server.url);

  yield server.join();
}
```

## Development

To run the tests:

``` sh
$ yarn test
```
