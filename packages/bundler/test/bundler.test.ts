import { timeout } from 'effection';
import { describe } from 'mocha';
import { promises as fs, existsSync } from 'fs';
import expect from 'expect';
import rmrf from 'rimraf';
import { subscribe } from '@effection/subscription';
import { spawn } from './world';
import { Bundler } from '../src/index';

describe("Bundler", function() {
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

        bundler = await spawn(Bundler.create({
          watch: true,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }));

        await spawn(subscribe(bundler).match({ type: 'UPDATE' }).first());
      });

      it('builds the sources into the output directory', () => {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });

      describe('introducing an error', () => {
        beforeEach(async () => {
          await spawn(timeout(10));
          await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");
        });

        it('emits an error event', async () => {
          let message = spawn(subscribe(bundler).match({ type: 'ERROR' }).first());
          await expect(message).resolves.toHaveProperty('type', 'ERROR');
        });
      });
    });

    describe('failure', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create({
          watch: true,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }));
      });

      it('emits an error', async () => {
        let message = spawn(subscribe(bundler).match({ type: 'ERROR' }).first());

        await expect(message).resolves.toHaveProperty('type', 'ERROR');
      });

      describe('fixing the error', () => {
        beforeEach(async () => {
          await spawn(subscribe(bundler).match({ type: 'ERROR' }).first());
          await spawn(timeout(10));
          await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");
        });

        it('emits an update event', async () => {
          let message = spawn(subscribe(bundler).match({ type: 'UPDATE' }).first());

          await expect(message).resolves.toHaveProperty('type', 'UPDATE');
        });
      });
    });
  });

  describe("TypeScript support", () => {
    describe('success', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create({
          watch: false,
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest"
        }));

        await spawn(subscribe(bundler).match({ type: 'UPDATE' }).first());
      });

      it('builds the sources into the output directory', () => {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });
    });

    describe('type error', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.ts", "const foo: number = 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create({
          watch: false,
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest"
        }));
      });

      it('fails on type error', async () => {
        let message = spawn(subscribe(bundler).match({ type: 'ERROR' }).first());

        await expect(message).resolves.toHaveProperty('type', 'ERROR');
      });
    });
  });

  describe('editing the sources', () => {
    beforeEach(async () => {
      await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

      bundler = await spawn(Bundler.create({
        watch: true,
        entry: "./build/test/sources/input.js",
        outFile: "./build/test/output/manifest.js",
        globalName: "__bigtestManifest"
      }));

      await fs.writeFile("./build/test/sources/input.js", "export default {hello: 'world'}\n");
    });

    it('notifies that a new build is available', async () => {
      let message = spawn(subscribe(bundler).match({ type: 'UPDATE' }).first());

      await expect(message).resolves.toHaveProperty('type', 'UPDATE');
    });
  });

  describe("with watch: false", () => {
    describe('success', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create({
          watch: false,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }));

        await spawn(subscribe(bundler).match({ type: 'UPDATE' }).first());
      });

      it('builds the sources into the output directory', () => {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });
    });

    describe('error', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");

        bundler = await spawn(Bundler.create({
          watch: false,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }));
      });

      it('emits an error event', async () => {
        let message = spawn(subscribe(bundler).match({ type: 'ERROR' }).first());
        await expect(message).resolves.toHaveProperty('type', 'ERROR');
      });
    });
  });
});
