import { describe } from 'mocha';
import { promises as fs, existsSync } from 'fs';
import * as expect from 'expect';

import { spawn } from './world';
import { Bundler } from '../src/index';

describe("Bundle Server", function() {
  this.timeout(5000);
  let bundler: Bundler;

  beforeEach(async () => {
    await fs.mkdir("./build/test/sources", { recursive: true });
    await fs.mkdir("./build/test/output", { recursive: true });
  });

  describe("JavaScript support", () => {
    beforeEach(async () => {
      await fs.mkdir("./build/test/sources", { recursive: true });
      await fs.mkdir("./build/test/output", { recursive: true });
      await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

      bundler = await spawn(Bundler.create(
        [{
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }],
      ));
    });

    it.only('builds the sources into the output directory', () => {
      expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
    });
  });

  describe("TypeScript support", () => {
    beforeEach(async () => {
      await fs.mkdir("./build/test/sources", { recursive: true });
      await fs.mkdir("./build/test/output", { recursive: true });
      await fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

      bundler = await spawn(Bundler.create(
        [{
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }],
      ));
    });

    it('builds the sources into the output directory', () => {
      expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
    });
  });

  describe('editing the sources', () => {
    let message: { type: string };

    beforeEach(async () => {
      await fs.mkdir("./build/test/sources", { recursive: true });
      await fs.mkdir("./build/test/output", { recursive: true });
      await fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

      bundler = await spawn(Bundler.create(
        [{
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }],
      ))
    });

    beforeEach(async function() {
      await fs.writeFile("./build/test/sources/input.ts", "export default {hello: 'world'}\n");
      message = await spawn(bundler.receive());
    });

    it('notifies that a new build is available', () => {
      expect(message).toEqual({ type: "update" });
    });
  });
})
