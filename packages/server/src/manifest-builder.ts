import { bigtestGlobals } from '@bigtest/globals';
import { Operation } from 'effection';
import { subscribe } from '@effection/subscription';
import { once } from '@effection/events';
import { validateTest } from '@bigtest/suite';
import { Deferred } from '@bigtest/effection';
import { Bundler } from '@bigtest/bundler';
import { Slice } from '@bigtest/atom';
import { createFingerprint } from 'fprint';
import  path from 'path';
import  fs from 'fs';
import { OrchestratorState } from './orchestrator/state';
import { assertBundlerState, assertCanTransition } from '../src/assertions/bundler-assertions';


const { copyFile, mkdir, stat, appendFile, open } = fs.promises;

interface ManifestBuilderOptions {
  watch: boolean;
  atom: Slice<OrchestratorState>;
  srcPath: string;
  buildDir: string;
  distDir: string;
  tsconfig?: string;
};

function* ftruncate(fd: number, len: number): Operation<void> {
  let { resolve, reject, promise } = Deferred<void>();

  fs.ftruncate(fd, len, err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });

  yield promise;
}

// https://github.com/nodejs/node/issues/34189#issuecomment-654878715
function* truncate(path: string, len: number): Operation {
  let file: fs.promises.FileHandle = yield open(path, 'r+');

  try {
    yield ftruncate(file.fd, len);
  } finally {
    file.close();
  }
}

export function* updateSourceMapURL(filePath: string, sourcemapName: string): Operation{
  let { size } = yield stat(filePath);
  let readStream = fs.createReadStream(filePath, {start: size - 16});
  let [currentURL]: [Buffer] = yield once(readStream, 'data');

  if (currentURL.toString().trim() === 'manifest.js.map') {
    yield truncate(filePath, size - 16);
    yield appendFile(filePath, sourcemapName);
  } else {
    throw new Error(`Expected a sourcemapping near the end of the generated test bundle, but found "${currentURL}" instead.`);
  };
}

function* processManifest(options: ManifestBuilderOptions): Operation {
  let buildPath = path.resolve(options.buildDir, 'manifest.js');
  let sourcemapDir = path.resolve(options.buildDir, 'manifest.js.map');
  let fingerprint = yield createFingerprint(buildPath, 'sha256');
  let fileName = `manifest-${fingerprint}.js`;
  let sourcemapName = `${fileName}.map`;
  let distPath = path.resolve(options.distDir, fileName);
  let mapPath = path.resolve(options.distDir, sourcemapName);

  yield mkdir(path.dirname(distPath), { recursive: true });
  yield copyFile(buildPath, distPath);
  yield copyFile(sourcemapDir, mapPath);
  yield updateSourceMapURL(distPath, sourcemapName);

  let manifest = yield import(distPath);

  manifest = manifest.default || manifest;
  manifest.fileName = fileName;

  validateTest(manifest);

  let slice = options.atom.slice('manifest');

  slice.update(() => ({ ...manifest }));

  return distPath;
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  let bundlerSlice = options.atom.slice('bundler');

  bundlerSlice.set({ type: 'UNBUNDLED' });

  let bundler: Bundler = yield Bundler.create({
    watch: options.watch,
    entry: options.srcPath,
    globalName: bigtestGlobals.manifestProperty,
    outFile: path.join(options.buildDir, "manifest.js"),
    tsconfig: options.tsconfig,
  });

  yield subscribe(bundler).forEach(function* (message) {
    switch (message.type) {
      case 'START':
        console.debug("[manifest builder] received bundler start");

        bundlerSlice.update(() => ({ type: 'BUILDING', warnings: [] }));
        break;
      case 'UPDATE':
        console.debug("[manifest builder] received bundle update");

        try {
          let path: string = yield processManifest(options);

          console.debug("[manifest builder] manifest ready");
          bundlerSlice.update((previous) => {
            assertCanTransition(previous?.type, { to: 'BUILDING' });

            return { ...previous, type: 'GREEN', path };
          });
        } catch(error) {
          console.debug("[manifest builder] error loading manifest");
          bundlerSlice.update(() => ({ type: 'ERRORED', error }));
        }

        break;
      case 'ERROR':
        console.debug("[manifest builder] received bundle error");

        bundlerSlice.update(() => ({ type: 'ERRORED', error: message.error }));
        break;
      case 'WARN':
        console.debug("received bundle warning", message.warning);

        bundlerSlice.update((previous) => {
          assertBundlerState(previous.type, {is: ['BUILDING', 'GREEN']});

          let warnings = !!previous.warnings ? [...previous.warnings, message.warning] : [message.warning];

          return {...previous, warnings };
        });
        break;
    }
  });
}
