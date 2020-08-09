import { bigtestGlobals } from '@bigtest/globals';
import { Operation, spawn } from 'effection';
import { once } from '@effection/events';
import { Deferred } from '@bigtest/effection';
import { Bundler, BundlerState } from '@bigtest/bundler';
import { Atom } from '@bigtest/atom';
import { createFingerprint } from 'fprint';
import * as path from 'path';
import * as fs from 'fs';

import { OrchestratorState, Manifest } from './orchestrator/state';
import { assert } from '@bigtest/project';

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

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  let bundlerSlice = options.atom.slice('bundle');

  bundlerSlice.set({ status: 'building', warnings: [] })
  
  yield Bundler.create(
    [{
      entry: options.srcPath,
      globalName: bigtestGlobals.manifestProperty,
      outFile: path.join(options.buildDir, "manifest.js")
    }],
    bundlerSlice
  );

  console.debug("[manifest builder] manifest ready");
  
  yield bundlerSlice.once(({ status }) => status === 'end');

  console.debug("[manifest builder] bundle built");

  let distPath: string = yield processManifest(options);
        
  bundlerSlice.update(() => ({ status: 'green', path: distPath }));
  
  yield Subscribable.from(bundlerSlice).forEach(function* (message) {
    // TODO: is there a need to do anything with errors here??
    if(message.status === 'updated') {
      let distPath = yield processManifest(options);
      console.info("[manifest builder] manifest updated");
      bundlerSlice.update(() => ({ status: 'updated', path: distPath }))
    }
  });
}
