import { main } from '../src/main';

import { ParcelProcess } from '../src/index';

main(function* start() {
  let parcel: ParcelProcess = yield ParcelProcess.create({
    buildDir: "./build",
    srcPath: "./examples/*.ts",
    stdio: "inherit"
  });

  while (true) {
    let message = yield parcel.receive();

    console.log('from parcel process: ', message);
  }
});
