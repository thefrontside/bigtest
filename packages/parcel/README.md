# @bigtest/parcel

Control a parcel worker farm with visibility into key work events.

When parcel is running, it starts up a bunch of processes to do the
actual work of compilation and bundling in parallel. This is what we
want, but because of the way its implemented, it is possible that if
shutdown happens too quickly, or while it is in the middle of a
bundle, then it can leave a bunch of processes hanging around.

This solves the problem by wrapping an effection resource around a
parcel process and killing it off, and all children whenever it passes
out of scope.

Also, it isn't enough just to be running parcel, we have to know that
it is up and running, and when new builds are available. For this, the
parcel process implements the `receive()` method to get messages about
when a new build is available.

## Synopsis

``` typescript
import { ParcelProcess } from '@bigtest/parcel';

function* start() {

  // this operation does not complete until parcel is up and running
  let parcel: ParcelProcess = yield ParcelProcess.create({
    buildDir: './build',
    srcPath: './tests/*.test.{js,ts}'
  });

  while (true) {
    let message = yield parcel.receive({ type: "update" });
    console.log('new build happened: ', message);
  }
}
```

## Development

``` shell
$ yarn start
```

## Testing

``` shell
$ yarn test
```
