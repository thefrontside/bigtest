import { Operation } from 'effection';
import { Mailbox } from '@effection/events';
import { ChildProcess, fork as forkProcess } from '@effection/child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as fprint from 'fprint';
import { assoc } from 'ramda';

import { Atom } from './orchestrator/atom';

const { copyFile, mkdir } = fs.promises;

interface ManifestBuilderOptions {
  delegate: Mailbox;
  atom: Atom;
  manifestPath: string;
  buildPath: string;
  distPath: string;
};

function* processManifest(options: ManifestBuilderOptions): Operation {
  let buildPath = path.resolve(options.buildPath, 'manifest.js');
  let fingerprint = yield fprint(buildPath, 'sha256');
  let filename = `manifest-${fingerprint}.js`;
  let distPath = path.resolve(options.distPath, filename);

  yield mkdir(path.dirname(distPath), { recursive: true });
  yield copyFile(buildPath, distPath);

  let manifest = yield import(distPath);
  manifest.name = filename;
  options.atom.update(assoc('manifest', manifest));

  return distPath;
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  // TODO: @precompile this should use node rather than ts-node when running as a compiled package
  let child: ChildProcess = yield forkProcess(
    './bin/parcel-server.ts',
    ['--out-dir', options.buildPath, '--out-file', 'manifest.js', '--global', '__bigtestManifest', options.manifestPath],
    {
      execPath: 'ts-node',
      execArgv: [],
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    }
  );

  let messages = yield Mailbox.watch(child, "message", ({ args: [message] }) => message);

  yield messages.receive({ type: "ready" });
  let distPath = yield processManifest(options);

  console.debug("[manifest builder] manifest ready");
  options.delegate.send({ status: "ready", path: distPath });

  while(true) {
    yield messages.receive({ type: "update" });
    let distPath = yield processManifest(options);

    console.debug("[manifest builder] manifest updated");
    options.delegate.send({ event: "update", path: distPath });
  }
}
