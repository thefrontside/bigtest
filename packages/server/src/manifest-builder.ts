import { bigtestGlobals } from '@bigtest/globals';
import { Operation } from 'effection';
import { once } from '@effection/events';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { Deferred } from '@bigtest/effection';
import { Bundler, BundlerMessage } from '@bigtest/bundler';
import { Atom, Slice } from '@bigtest/atom';
import { createFingerprint } from 'fprint';
import * as path from 'path';
import * as fs from 'fs';

import { OrchestratorState, BundlerState, Manifest } from './orchestrator/state';
import { assert } from './assertions/assert';

const { copyFile, mkdir, stat, appendFile, open } = fs.promises;

interface ManifestBuilderOptions {
  atom: Atom<OrchestratorState>;
  srcPath: string;
  buildDir: string;
  distDir: string;
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

  let slice = options.atom.slice('manifest');
  
  slice.set(manifest as Manifest);

  return distPath;
}

function addBundlerErrorToSlice(message: BundlerMessage, bundlerSlice: Slice<BundlerState, OrchestratorState>): void {
  assert(message.type === 'error', `invalid message type ${message.type}`);
  
  bundlerSlice.update(previous => {
    if (previous.status !== 'errored'){
      return { status: 'errored', errors: [message.error], warnings: [] };
    }

    return { status: 'errored', errors: previous.errors.concat(message.error), warnings: previous.warnings };
  });
}

function* waitForSuccessfulBuild(bundlerEvents: ChainableSubscription<BundlerMessage, undefined>, bundlerSlice: Slice<BundlerState, OrchestratorState>): Operation {
  let message: BundlerMessage = yield bundlerEvents.expect();

  if (message.type === "error") {
    addBundlerErrorToSlice(message, bundlerSlice);
    yield waitForSuccessfulBuild(bundlerEvents, bundlerSlice);
  }
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  let bundlerSlice = options.atom.slice('bundle');

  bundlerSlice.set({ status: 'building' })
  
  let bundler: Bundler = yield Bundler.create(
    [{
      entry: options.srcPath,
      globalName: bigtestGlobals.manifestProperty,
      outFile: path.join(options.buildDir, "manifest.js")
    }]
  );
  
  let bundlerEvents: ChainableSubscription<BundlerMessage, undefined> = yield subscribe(bundler);

  yield waitForSuccessfulBuild(bundlerEvents, bundlerSlice);

  let distPath: string = yield processManifest(options);

  console.debug("[manifest builder] manifest ready");

  // not entirely sure if I use set or update here
  // TODO: should not transition until we have required the generated output yield import distpath
  bundlerSlice.update(() => ({ status: 'green', path: distPath, warnings: [] }));

  yield bundlerEvents.forEach(function*(message) {
    if(message.type === 'error') {
      addBundlerErrorToSlice(message, bundlerSlice);
    } else {
      let distPath = yield processManifest(options);
      console.info("[manifest builder] manifest updated");
      bundlerSlice.update(() => ({ status: 'updated', path: distPath }))
    }
  });
}
