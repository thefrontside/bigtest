import { bigtestGlobals } from '@bigtest/globals';
import { Operation, createFuture } from 'effection';
import { once } from '@effection/events';
import { validateTest } from '@bigtest/suite';
import { createBundler, Bundler } from '@bigtest/bundler';
import { Slice } from '@effection/atom';
import { createFingerprint } from 'fprint';
import path from 'path';
import fs from 'fs';
import { BundlerState, Manifest } from './orchestrator/state';
import { assertBundlerState, assertCanTransition } from '../src/assertions/bundler-assertions';


const { copyFile, mkdir, stat, appendFile, open } = fs.promises;

interface ManifestBuilderOptions {
  status: Slice<BundlerState>;
  manifest: Slice<Manifest>;
  watch: boolean;
  srcPath: string;
  buildDir: string;
  distDir: string;
  tsconfig?: string;
};

function* ftruncate(fd: number, len: number): Operation<void> {
  let { produce, future } = createFuture<void>();

  fs.ftruncate(fd, len, err => {
    if (err) {
      produce({ state: 'errored', error: err });
    } else {
      produce({ state: 'completed', value: undefined });
    }
  });

  yield future;
}

// https://github.com/nodejs/node/issues/34189#issuecomment-654878715
function* truncate(path: string, len: number): Operation<void> {
  let file: fs.promises.FileHandle = yield open(path, 'r+');

  try {
    yield ftruncate(file.fd, len);
  } finally {
    file.close();
  }
}

const SOURCE_MAP_PATH = 'manifest.js.map';
const SOURCE_MAP_LENGTH = SOURCE_MAP_PATH.length + 1;

export function* updateSourceMapURL(filePath: string, sourcemapName: string): Operation<void> {
  let { size } = yield stat(filePath);
  let readStream = fs.createReadStream(filePath, {start: size - SOURCE_MAP_LENGTH});
  let currentURL: string = (yield once(readStream, 'data')).toString();

  if (currentURL.trim() === SOURCE_MAP_PATH) {
    yield truncate(filePath, size - SOURCE_MAP_LENGTH);
    yield appendFile(filePath, sourcemapName);
  } else {
    throw new Error(`Expected a sourcemapping near the end of the generated test bundle, but found "${currentURL}" instead.`);
  };
}

function* processManifest(options: ManifestBuilderOptions): Operation<string> {
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

  options.manifest.set(manifest);

  return distPath;
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation<void> {
  options.status.set({ type: 'UNBUNDLED' });

  let bundler: Bundler = yield createBundler({
    watch: options.watch,
    entry: options.srcPath,
    globalName: bigtestGlobals.manifestProperty,
    outFile: path.join(options.buildDir, "manifest.js"),
    tsconfig: options.tsconfig,
  });

  yield bundler.forEach((message) => function*() {
    switch (message.type) {
      case 'START':
        console.debug("[manifest builder] received bundler start");

        options.status.update(() => ({ type: 'BUILDING', warnings: [] }));
        break;
      case 'UPDATE':
        if(options.status.get().type === 'ERRORED') {
          break;
        }
        console.debug("[manifest builder] received bundle update");

        try {
          let path: string = yield processManifest(options);

          console.debug("[manifest builder] manifest ready");
          options.status.update((previous) => {
            assertCanTransition(previous?.type, { to: 'BUILDING' });

            return { ...previous, type: 'GREEN', path };
          });
        } catch(error) {
          console.debug("[manifest builder] error loading manifest");
          options.status.update(() => ({ type: 'ERRORED', error }));
        }

        break;
      case 'ERROR':
        console.debug("[manifest builder] received bundle error");

        options.status.update(() => ({ type: 'ERRORED', error: message.error }));
        break;
      case 'WARN':
        console.debug("received bundle warning", message.warning);

        options.status.update((previous) => {
          assertBundlerState(previous.type, {is: ['BUILDING', 'GREEN']});

          let warnings = !!previous.warnings ? [...previous.warnings, message.warning] : [message.warning];

          return {...previous, warnings };
        });
        break;
    }
  });
}
