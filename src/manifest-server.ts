import { fork, Operation } from 'effection';
import { Mailbox } from '@effection/events';
import { ChildProcess, fork as forkProcess } from '@effection/child_process';
import * as path from 'path';
import { assoc } from 'ramda';

import { Atom } from './orchestrator/atom';

interface ManifestServerOptions {
  atom: Atom;
  manifestPath: string;
  port: number;
};

function* loadManifest(atom: Atom, outDir: string) {
  let fullPath = path.resolve(outDir, 'manifest.js');

  delete require.cache[fullPath];
  let manifest = yield import(fullPath);

  atom.update(assoc('manifest', manifest));
}

export function* createManifestServer(mail: Mailbox, options: ManifestServerOptions): Operation {
  // TODO: @precompile this should use node rather than ts-node when running as a compiled package
  let child: ChildProcess = yield forkProcess(
    './bin/parcel-server.ts',
    ['-p', `${options.port}`, '--out-file', 'manifest.js', '--global', '__bigtestManifest', options.manifestPath],
    {
      execPath: 'ts-node',
      execArgv: [],
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    }
  );

  let messages = yield Mailbox.watch(child, "message", ({ args: [message] }) => message);

  let { options: { outDir } } = yield messages.receive({ type: "ready" });

  console.debug("[test files] test files initialized");

  yield fork(loadManifest(options.atom, outDir));
  mail.send({ ready: "manifest-server" });

  while(true) {
    yield messages.receive({ type: "update" });

    console.debug("[test files] test files updated");

    yield fork(loadManifest(options.atom, outDir));
    mail.send({ update: "manifest-server" });
  }
}
