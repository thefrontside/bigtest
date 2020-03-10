import { describe } from 'mocha';
import { promises as fs, existsSync } from 'fs';
import * as expect from 'expect';

import { spawn } from './world';
import { ParcelProcess } from '../src/index';

describe("Parcel Process", () => {
  let parcel: ParcelProcess;

  beforeEach(async function() {
    this.timeout(10000);

    await fs.mkdir("./build/test/sources", { recursive: true });
    await fs.mkdir("./build/test/output", { recursive: true });
    await fs.writeFile("./build/test/sources/input.ts", "export default {}\n");

    parcel = await spawn(ParcelProcess.create({
      buildDir: "./build/test/output",
      srcPath: "./build/test/sources/*.ts",
      execPath: 'ts-node'
    }))
  });

  it('builds the sources into the output directory', () => {
    expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
  });

  describe('editting the  sources', () => {
    let message: { type: string };

    beforeEach(async () => {
      await fs.writeFile("./build/test/sources/input.ts", "export default {hello: 'world'}\n");
      message = await spawn(parcel.receive());
    });

    it('notifies that a new build is available', () => {
      expect(message).toEqual({ type: "update" });
    });
  });
})
