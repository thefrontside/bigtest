import { describe } from 'mocha';
import { promises as fs, existsSync } from 'fs';
import * as expect from 'expect';
import * as rmrf from 'rimraf';

import { spawn } from './world';
import { Bundler } from '../src/index';

describe("Bundle Server", function() {
  this.timeout(5000);
  let bundler: Bundler;

  beforeEach((done) => rmrf('./build', done));
  beforeEach(async () => {
    await fs.mkdir("./build/test/sources", { recursive: true });
    await fs.mkdir("./build/test/output", { recursive: true });
  });

  describe("JavaScript support", () => {
    describe('success', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.js",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
        ));
      });

      it('builds the sources into the output directory', () => {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });

      describe('introducing an error', () => {
        beforeEach(async () => {
          await spawn(bundler.receive());
          await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");
        });

        it('emits an error event', async () => {
          await expect(spawn(bundler.receive())).resolves.toHaveProperty('type', 'error');
        });
      });
    });

    describe('failure', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.js",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
        ));
      });

      it('emits an error', async () => {
        await expect(spawn(bundler.receive())).resolves.toHaveProperty('type', 'error');
      });

      describe('fixing the error', () => {
        beforeEach(async () => {
          await spawn(bundler.receive());
          await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");
        });

        it('emits an update event', async () => {
          await expect(spawn(bundler.receive())).resolves.toHaveProperty('type', 'update');
        });
      });
    });
  });

  describe("TypeScript support", () => {
    describe('success', () => {
      beforeEach(async () => {
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

    describe('failure', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.ts", "const foo: number = 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.ts",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
        ));
      });

      it('does not typecheck, just transform', async () => {
        await expect(spawn(bundler.receive())).resolves.toHaveProperty('type', 'update');
      });
    })
  });

  describe('editing the sources', () => {
    beforeEach(async () => {
      await fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

      bundler = await spawn(Bundler.create(
        [{
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }],
      ));
      await fs.writeFile("./build/test/sources/input.ts", "export default {hello: 'world'}\n");
    });

    it('notifies that a new build is available', async () => {
      await expect(spawn(bundler.receive())).resolves.toHaveProperty('type', 'update');
    });
  });
})
