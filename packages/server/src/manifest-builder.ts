import { Operation } from 'effection';
import { on } from '@effection/events';
import { Mailbox } from '@bigtest/effection';
import { ParcelProcess } from '@bigtest/parcel';
import { Atom } from '@bigtest/atom';
import { createFingerprint } from 'fprint';

import * as path from 'path';
import * as fs from 'fs';

import { Test } from '@bigtest/suite';

import { OrchestratorState } from './orchestrator/state';

const { copyFile, mkdir, truncate } = fs.promises;

interface ManifestBuilderOptions {
  delegate: Mailbox;
  atom: Atom<OrchestratorState>;
  srcPath: string;
  buildDir: string;
  distDir: string;
};

function* updateSourceMapURL(filePath: string, sourcemapName: string){
  let { size } = fs.statSync(filePath);
  let readStream = fs.createReadStream(filePath, {start: size - 16});
  let onRead = yield on(readStream, 'data');
  let currentURL = yield onRead.next();
  
  try {
    if( currentURL.value.toString('utf-8') == '/manifest.js.map' ){
      yield truncate(filePath, size - 16);
      fs.appendFileSync(filePath, sourcemapName);
    } else {
      throw "Unexpected placement and or formatting of sourceMappingURL in the manifest"
    };
  } catch (error) {
    throw error;
  }
}

function* processManifest(options: ManifestBuilderOptions): Operation {
  let buildDir = path.resolve(options.buildDir, 'manifest.js');
  let sourcemapDir = path.resolve(options.buildDir, 'manifest.js.map');
  let fingerprint = yield createFingerprint(buildDir, 'sha256');
  let fileName = `manifest-${fingerprint}.js`;
  let sourcemapName = `${fileName}.map`;
  let distPath = path.resolve(options.distDir, fileName);
  let mapPath = path.resolve(options.distDir, sourcemapName);

  yield mkdir(path.dirname(distPath), { recursive: true });
  yield copyFile(buildDir, distPath);
  yield copyFile(sourcemapDir, mapPath);
  yield updateSourceMapURL(distPath, sourcemapName);

  let manifest = yield import(distPath);

  manifest = manifest.default || manifest;

  manifest.fileName = fileName;


  let slice = options.atom.slice<Test>(['manifest']);
  slice.set(manifest as Test);

  return distPath;
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  let parcel: ParcelProcess = yield ParcelProcess.create(
    [options.srcPath],
    {
      outDir: options.buildDir,
      global: "__bigtestManifest",
      outFile: "manifest.js"
    }
  );

  let distPath = yield processManifest(options);

  console.debug("[manifest builder] manifest ready");
  options.delegate.send({ status: "ready", path: distPath });

  while(true) {
    yield parcel.receive({ type: "update" });
    let distPath = yield processManifest(options);

    console.debug("[manifest builder] manifest updated");
    options.delegate.send({ event: "update", path: distPath });
  }
}
