import * as Path from 'path';
import { ChildProcess, fork as forkProcess } from 'child_process';

import { monitor, resource, Operation } from 'effection'
import { Mailbox, SubscriptionMessage } from '@bigtest/effection';
import { once, throwOnErrorEvent } from '@effection/events';

type ParcelMessage = { type: "ready" } | { type: "update" };

interface ParcelOptions  {
  buildDir: string;
  sourceEntries: string | string[];
  global: string;
  outFile: string;

  stdio?: 'pipe' | 'inherit';
  execPath?: 'ts-node' | undefined;
}

export class ParcelProcess {
  mailbox: Mailbox = new Mailbox();

  static *create(options: ParcelOptions): Operation {
    let stdioMode = options.stdio || 'pipe';
    let parcelProcess = new ParcelProcess();

    let entries = [].concat(options.sourceEntries);
    let runParcel = Path.join(__dirname, 'parcel-run');
    let child: ChildProcess = forkProcess(
      runParcel,
      ['--out-dir', options.buildDir, '--out-file', options.outFile, '--global', options.global, ...entries],
      {
        execPath: options.execPath || undefined,
        stdio: [stdioMode, stdioMode, stdioMode, 'ipc'],
        detached: true,
        env: { NODE_ENV: 'test', ...process.env }
      }
    );

    let readiness = new Mailbox();

    let res = yield resource(parcelProcess, function* supervise() {
      // Killing all child processes started by this command is surprisingly
      // tricky. If a process spawns another processes and we kill the parent,
      // then the child process is NOT automatically killed. Instead we're using
      // the `detached` option to force the child into its own process group,
      // which all of its children in turn will inherit. By sending the signal to
      // `-pid` rather than `pid`, we are sending it to the entire process group
      // instead. This will send the signal to all processes started by the child
      // process.
      //
      // More information here: https://unix.stackexchange.com/questions/14815/process-descendants
      try {
        let events: Mailbox<SubscriptionMessage> = yield Mailbox.subscribe(child, "message");
        let messages: Mailbox<ParcelMessage> = yield events.map(({ args: [message] }) => message);

        yield throwOnErrorEvent(child);

        yield messages.receive({ type: "ready" });
        readiness.send("ready");

        // deliver "update" messages to the main parcel process object
        yield monitor(function* () {
          while (true) {
            let message = yield messages.receive();
            parcelProcess.mailbox.send(message);
          }
        })

        let [code]: [number] = yield once(child, "exit");

        if(code !== 0) {
          throw new Error("child exited with non-zero exit code")
        }
      } finally {
        try {
          process.kill(-child.pid, "SIGTERM")
        } catch(e) {
          // do nothing, process is probably already dead
        }
      }
    });

    yield readiness.receive();

    return res;
  }

  receive(pattern: unknown = undefined): Operation {
    return this.mailbox.receive(pattern);
  }
}
