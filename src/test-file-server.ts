import { send, receive, Operation, Context } from 'effection';
import { watch } from '@effection/events';
import { ChildProcess, fork as forkProcess } from '@effection/child_process';

interface TestFileServerOptions {
  files: [string];
  manifestPath: string;
  port: number;
};

export function* createTestFileServer(orchestrator: Context, options: TestFileServerOptions): Operation {
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

  yield watch(child, "message", (message) => message)

  yield receive({ type: "ready" });
  yield send({ ready: "test-files" }, orchestrator);

  while(true) {
    yield receive({ type: "update" });
    console.debug("[test files] test files updated");
  }
}
