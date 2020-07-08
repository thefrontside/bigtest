# @bigtest/bundler

Control Rollup with visibility into key work events.

Also, it isn't enough just to be running Rollup, we have to know that
it is up and running, and when new builds are available. For this, the
`Bundler` interface implements the `receive()` method to get messages about
when a new build is available.

## Synopsis

``` typescript
import { Bundler } from '@bigtest/bundler';
import { subscribe } from '@effection/subscription';

function* start() {
  let bundler: Bundler = yield Bundler.create([{
    entry: 'src/index.js',
    outFile: 'dist/index.js'
  }]);
  let subscription = yield subscribe(bundler);

  yield subscription.forEach(function*(message) {
    console.log('new build happened:', message);
  });
}
```

## Testing

``` shell
$ yarn test
```
