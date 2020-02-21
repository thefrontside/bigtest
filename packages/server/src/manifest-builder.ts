import { fork, Operation } from 'effection';
import { Mailbox } from '@effection/events';
import { ChildProcess, fork as forkProcess } from '@effection/child_process';
import * as path from 'path';
import { assoc } from 'ramda';

import { Atom } from './orchestrator/atom';

interface ManifestBuilderOptions {
  delegate: Mailbox;
  atom: Atom;
  manifestPath: string;
  distPath: string;
};

function* loadManifest(atom: Atom, manifestPath: string) {
  delete require.cache[manifestPath];
  let manifest = yield import(manifestPath);

  atom.update(assoc('manifest', manifest));
}

export function* createManifestBuilder(options: ManifestBuilderOptions): Operation {
  // TODO: @precompile this should use node rather than ts-node when running as a compiled package
  let child: ChildProcess = yield forkProcess(
    './bin/parcel-server.ts',
    ['--out-dir', options.distPath, '--out-file', 'manifest.js', '--global', '__bigtestManifest', options.manifestPath],
    {
      execPath: 'ts-node',
      execArgv: [],
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    }
  );

  let messages = yield Mailbox.watch(child, "message", ({ args: [message] }) => message);

  let { options: { outDir } } = yield messages.receive({ type: "ready" });

  let manifestPath = path.resolve(outDir, 'manifest.js');

  yield fork(loadManifest(options.atom, manifestPath));
  console.debug("[manifest builder] manifest ready");
  options.delegate.send({ status: "ready", path: manifestPath });

  while(true) {
    yield messages.receive({ type: "update" });

    yield fork(loadManifest(options.atom, manifestPath));

    console.debug("[manifest builder] manifest updated");
    options.delegate.send({ event: "update", path: manifestPath });
  }
}
