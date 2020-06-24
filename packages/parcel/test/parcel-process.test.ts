import { describe } from 'mocha';
import { promises as fs, existsSync } from 'fs';
import * as expect from 'expect';

import { spawn } from './world';
import { ParcelProcess } from '../src/index';

describe("Parcel Process", function() {
  this.timeout(20000);
  let parcel: ParcelProcess;

  beforeEach(async () => {
    await fs.mkdir("./build/test/sources", { recursive: true });
    await fs.mkdir("./build/test/output", { recursive: true });
    await fs.writeFile("./build/test/sources/input.ts", "export default {}\n");

    parcel = await spawn(ParcelProcess.create(
      ["./build/test/sources/*.ts"],
      {
        distDir: './build/test/output',
        outFile: 'manifest.js',
        scopeHoist: true,
        execPath: 'ts-node',
        execArgv: ['-T']
      }
    ))
  });

  it('builds the sources into the output directory', () => {
    expect(existsSync("./build/test/output/input.js")).toEqual(true);
  });

  describe('editing the sources', () => {
    let message: { type: string };

    beforeEach(async function() {
      await fs.writeFile("./build/test/sources/input.ts", "export default {hello: 'world'}\n");
      message = await spawn(parcel.receive());
    });

    it('notifies that a new build is available', () => {
      expect(message).toEqual({ type: "update" });
    });
  });
})
