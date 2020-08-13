import { describe } from 'mocha';
import { promises as fs, existsSync } from 'fs';
import expect from 'expect';
import rmrf from 'rimraf';
import { spawn } from './world';
import { Bundler, BundlerState } from '../src/index';
import { Atom, Slice } from '@bigtest/atom';

type State = {
  bundler: BundlerState;
}

describe("Bundler", function() {
  let bundlerSlice: Slice<BundlerState, State>;
  this.timeout(5000);
  beforeEach((done) => rmrf('./build', done));
  beforeEach(async () => {
    await fs.mkdir("./build/test/sources", { recursive: true });
    await fs.mkdir("./build/test/output", { recursive: true });
  });

  describe("JavaScript support", () => {
    describe('success', () => {
      beforeEach(async () => {
        await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");

        bundlerSlice = new Atom<State>({ bundler: { status: 'building', warnings: [] } }).slice('bundler');
        
        await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.js",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
          bundlerSlice
        ));
        
        await spawn(bundlerSlice.once(({ status }) => status === 'end'));
      });

      it('builds the sources into the output directory', () => {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });

      describe('introducing an error', () => {
        beforeEach(async () => {
          await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");
        });

        it('emits an error event', async () => {
          let state = await spawn<BundlerState>(bundlerSlice.once(({ status }) => status === 'errored'));

          expect(state.status === 'errored' && state.error.frame).toBe("1: const foo - 'bar';\n             ^\n2: export default foo;");
        });
      });
    });

    describe('failure', () => {
      beforeEach(async () => {
        bundlerSlice = new Atom<State>({ bundler: { status: 'building', warnings: [] } }).slice('bundler');
        await fs.writeFile("./build/test/sources/input.js", "const foo - 'bar';\nexport default foo;\n");

        await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.js",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
          bundlerSlice
        ));
      });

      it('emits an error', async () => {
        let state = await spawn<BundlerState>(bundlerSlice.once(({ status }) => status === 'errored'));
        
        await expect(state.status === 'errored' && state.error).toBeTruthy();
      });

      describe('fixing the error', () => {
        beforeEach(async () => {
          await fs.writeFile("./build/test/sources/input.js", "const foo = 'bar';\nexport default foo;\n");
        });

        it('emits an end event', async () => {
          let state = await spawn<BundlerState>(bundlerSlice.once(({ status }) => status === 'end'));
          
          await expect(state.status).toBe('end');
        });
      });
    });
  });

  describe("TypeScript support", () => {
    describe('success', () => {
      beforeEach(async () => {
        bundlerSlice = new Atom<State>({ bundler: { status: 'building', warnings: [] } }).slice('bundler');
        await fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

        await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.ts",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
          bundlerSlice
        ));
        
        await spawn(bundlerSlice.once(({ status }) => status === 'end'));
      });

      it('builds the sources into the output directory', () => {
        expect(existsSync("./build/test/output/manifest.js")).toEqual(true);
      });
    });

    describe('type error', () => {
      beforeEach(async () => {
        bundlerSlice = new Atom<State>({ bundler: { status: 'building', warnings: [] } }).slice('bundler');
        await fs.writeFile("./build/test/sources/input.ts", "const foo: number = 'bar';\nexport default foo;\n");

        await spawn(Bundler.create(
          [{
            entry: "./build/test/sources/input.ts",
            outFile: "./build/test/output/manifest.js",
            globalName: "__bigtestManifest",
          }],
          bundlerSlice
        ));
      });

      it('does not typecheck, just transform', async () => {
        let state = await spawn<BundlerState>(bundlerSlice.once(({ status }) => status === 'end'));
          
        await expect(state.status).toBe('end');
      });
    })
  });

  describe('editing the sources', () => {
    beforeEach(async () => {
      bundlerSlice = new Atom<State>({ bundler: { status: 'building', warnings: [] } }).slice('bundler');
      await fs.writeFile("./build/test/sources/input.ts", "const foo: string = 'bar';\nexport default foo;\n");

      await spawn(Bundler.create(
        [{
          entry: "./build/test/sources/input.ts",
          outFile: "./build/test/output/manifest.js",
          globalName: "__bigtestManifest",
        }],
        bundlerSlice
      ));
      
      await fs.writeFile("./build/test/sources/input.ts", "export default {hello: 'world'}\n");
    });

    it('notifies that a new build is available', async () => {
      let state = await spawn<BundlerState>(bundlerSlice.once(({ status }) => status === 'end'));
          
      await expect(state.status).toBe('end');
    });
  });
})
