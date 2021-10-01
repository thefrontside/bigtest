import { describe, it, beforeEach } from '@effection/mocha';
import { sleep, createFuture } from 'effection';
import { promises as fs, existsSync } from 'fs';
import expect from 'expect';
import rmrf from 'rimraf';
import { createBundler, Bundler } from '../src/index';

describe("Bundler", function() {
  let bundler: Bundler;

  beforeEach(function*() {
    let { resolve, future } = createFuture();
    rmrf('./build', resolve);
    yield future;
    yield fs.mkdir("./build/test/sources", { recursive: true });
    yield fs.mkdir("./build/test/output", { recursive: true });
  });

  describe("JavaScript support", () => {
    describe('success', () => {
      beforeEach(function*() {
        yield fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

        bundler = yield createBundler({
          watch: true,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        });

        yield bundler.match({ type: 'UPDATE' }).first();
      });

      it('builds the sources into the output directory', function*() {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });

      describe('introducing an error', () => {
        beforeEach(function*() {
          yield sleep(10);
          yield fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");
        });

        it('emits an error event', function*() {
          let message = yield bundler.match({ type: 'ERROR' }).first();
          expect(message).toHaveProperty('type', 'ERROR');
        });
      });
    });

    describe('failure', () => {
      beforeEach(function*() {
        yield fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");

        bundler = yield createBundler({
          watch: true,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        });
      });

      it('emits an error', function*() {
        let message = yield bundler.match({ type: 'ERROR' }).first();

        expect(message).toHaveProperty('type', 'ERROR');
      });

      describe('fixing the error', () => {
        beforeEach(function*() {
          yield bundler.match({ type: 'ERROR' }).first();
          yield sleep(10);
          yield fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");
        });

        it('emits an update event', function*() {
          let message = yield bundler.match({ type: 'UPDATE' }).first();

          expect(message).toHaveProperty('type', 'UPDATE');
        });
      });
    });
  });

  describe("TypeScript support", () => {
    describe('success', () => {
      beforeEach(function*() {
        yield fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

        bundler = yield createBundler({
          watch: false,
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest"
        });

        yield bundler.match({ type: 'UPDATE' }).first();
      });

      it('builds the sources into the output directory', function*() {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });
    });

    describe('type error', () => {
      beforeEach(function*() {
        yield fs.writeFile("./build/test/sources/input.ts", "const foo: number = 'bar';\nexport default foo;\n");

        bundler = yield createBundler({
          watch: false,
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest"
        });
      });

      it('fails on type error', function*() {
        let message = yield bundler.match({ type: 'ERROR' }).first();

        expect(message).toHaveProperty('type', 'ERROR');
      });
    })
  });

  describe('editing the sources', () => {
    beforeEach(function*() {
      yield fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

      bundler = yield createBundler({
        watch: true,
        entry: "./build/test/sources/input.js",
        outFile: "./build/test/output/manifest.js",
        globalName: "__bigtestManifest"
      });

      yield fs.writeFile("./build/test/sources/input.js", "export default {hello: 'world'}\n");
    });

    it('notifies that a new build is available', function*() {
      let message = yield bundler.match({ type: 'UPDATE' }).first()

      expect(message).toHaveProperty('type', 'UPDATE');
    });
  });

  describe("with watch: false", () => {
    describe('success', () => {
      beforeEach(function*() {
        yield fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

        bundler = yield createBundler({
          watch: false,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        });

        yield bundler.match({ type: 'UPDATE' }).first();
      });

      it('builds the sources into the output directory', function*() {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });
    });

    describe('error', () => {
      beforeEach(function*() {
        yield fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");

        bundler = yield createBundler({
          watch: false,
          entry: "./build/test/sources/input.js",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        });
      });

      it('emits an error event', function*() {
        let message = yield bundler.match({ type: 'ERROR' }).first()
        expect(message).toHaveProperty('type', 'ERROR');
      });
    });
  });
})
