import { bigtestGlobals } from '@bigtest/globals';
import { Operation } from 'effection';
import { once } from '@effection/events';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { Mailbox } from '@bigtest/effection';
import { Bundler, BundlerMessage, BundlerError } from '@bigtest/bundler';
import { Atom } from '@bigtest/atom';
import { createFingerprint } from 'fprint';

import * as path from 'path';
import * as fs from 'fs';

import { Test } from '@bigtest/suite';

import { OrchestratorState } from './orchestrator/state';

interface ManifestBuilderOptions {
  delegate: Mailbox;
  atom: Atom<OrchestratorState>;
  srcPath: string;
  buildDir: string;
  distDir: string;
};

export function* updateSourceMapURL(filePath: string, sourcemapName: string): Operation{
  let { size } = fs.statSync(filePath);
  let readStream = fs.createReadStream(filePath, {start: size - 16});
  let [currentURL]: [Buffer] = yield once(readStream, 'data');

  if (currentURL.toString().trim() === 'manifest.js.map') {
    fs.truncateSync(filePath, size - 16);
    fs.appendFileSync(filePath, sourcemapName);
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

  fs.mkdirSync(path.dirname(distPath), { recursive: true });
  fs.copyFileSync(buildPath, distPath);
  fs.copyFileSync(sourcemapDir, mapPath);
  yield updateSourceMapURL(distPath, sourcemapName);

  let manifest = yield import(distPath);

  manifest = manifest.default || manifest;

  manifest.fileName = fileName;


  let slice = options.atom.slice<Test>(['manifest']);
  slice.set(manifest as Test);

  return distPath;
}

function logBuildError(error: BundlerError) {
  console.error("[manifest builder] build error:", error.message);
  if (error.frame) {
    console.error("[manifest builder] build error frame:\n", error.frame);
  }
}

function* waitForSuccessfulBuild(bundlerEvents: ChainableSubscription<BundlerMessage, undefined>, delegate: Mailbox): Operation {
  let message: BundlerMessage = yield bundlerEvents.expect();

  if (message.type === "error") {
    logBuildError(message.error);
    delegate.send({ event: "error" });
    yield waitForSuccessfulBuild(bundlerEvents, delegate);
  }
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  let bundler: Bundler = yield Bundler.create(
    [{
      entry: options.srcPath,
      globalName: bigtestGlobals.manifestProperty,
      outFile: path.join(options.buildDir, "manifest.js")
    }]
  );
  let bundlerEvents: ChainableSubscription<BundlerMessage, undefined> = yield subscribe(bundler);

  yield waitForSuccessfulBuild(bundlerEvents, options.delegate);

  let distPath: string = yield processManifest(options);

  console.debug("[manifest builder] manifest ready");

  options.delegate.send({ status: "ready", path: distPath });

  yield bundlerEvents.forEach(function*(message) {
    if (message.type === 'error') {
      logBuildError(message.error);
      options.delegate.send({ event: "error" });
    } else {
      let distPath = yield processManifest(options);
      console.info("[manifest builder] manifest updated");
      options.delegate.send({ event: "update", path: distPath });
    }
  });
}
