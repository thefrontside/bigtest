import { main } from '@effection/node';

import { ParcelProcess } from '../src/index';

main(function* start() {
  let parcel: ParcelProcess = yield ParcelProcess.create(
    ["./examples/*.ts"],
    {
      outDir: "./build",
      global: "__IamGlobal",
      outFile: "manifest.js",
      stdioMode: "inherit"
    }
  );

  while (true) {
    let message = yield parcel.receive();

    console.log('from parcel process: ', message);
  }
});
