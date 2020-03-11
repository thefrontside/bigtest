import { Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { ParcelProcess } from '@bigtest/parcel';
import * as path from 'path';
import * as fs from 'fs';
import * as fprint from 'fprint';

import { Test } from '@bigtest/suite';

import { Atom } from './orchestrator/atom';

const { copyFile, mkdir } = fs.promises;

interface ManifestBuilderOptions {
  delegate: Mailbox;
  atom: Atom;
  srcPath: string;
  buildDir: string;
  distDir: string;
};

function* processManifest(options: ManifestBuilderOptions): Operation {
  let buildDir = path.resolve(options.buildDir, 'manifest.js');
  let fingerprint = yield fprint(buildDir, 'sha256');
  let fileName = `manifest-${fingerprint}.js`;
  let distPath = path.resolve(options.distDir, fileName);

  yield mkdir(path.dirname(distPath), { recursive: true });
  yield copyFile(buildDir, distPath);

  let manifest = yield import(distPath);

  manifest = manifest.default || manifest;

  manifest.fileName = fileName;


  let slice = options.atom.slice<Test>(['manifest']);
  slice.set(manifest as Test);

  return distPath;
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {

  let parcel: ParcelProcess = yield ParcelProcess.create({
    buildDir: options.buildDir,
    sourceEntries: options.srcPath,
    global: "__bigtestManifest",
    outFile: "manifest.js"
  });

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
