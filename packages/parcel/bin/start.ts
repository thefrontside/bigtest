import { main } from '@effection/node';

import { ParcelProcess } from '../src/index';

main(function* start() {
  let parcel: ParcelProcess = yield ParcelProcess.create({
    buildDir: "./build",
    sourceEntries: "./examples/*.ts",
    global: "__IamGlobal",
    outFile: "manifest.js",
    stdio: "inherit"
  });

  while (true) {
    let message = yield parcel.receive();

    console.log('from parcel process: ', message);
  }
});
