import * as Path from 'path';
import { ParcelOptions } from  'parcel-bundler';

import { Operation } from 'effection'
import { Mailbox, SubscriptionMessage, readyResource } from '@bigtest/effection';
import { ChildProcess } from '@effection/node';

type ParcelMessage = { type: "ready" } | { type: "update" };

type ProcessOptions = { port?: number; stdioMode?: 'pipe' | 'inherit'; execPath?: string }

export class ParcelProcess {
  mailbox: Mailbox = new Mailbox();

  static *create(entries: string[], options: ParcelOptions & ProcessOptions): Operation {
    let parcelProcess = new ParcelProcess();

    return yield readyResource(parcelProcess, function*(ready): Operation<void> {
      let mode = options.stdioMode || 'pipe';
      let runParcel = Path.join(__dirname, 'parcel-run');

      let child = yield ChildProcess.fork(
        runParcel,
        [...entries, '--options', JSON.stringify(options)],
        {
          stdio: [mode, mode, mode, 'ipc'],
          detached: true,
          env: { NODE_ENV: 'test', ...process.env },
          execPath: options.execPath,
        }
      );

      let events: Mailbox<SubscriptionMessage> = yield Mailbox.subscribe(child, "message");

      let messages: Mailbox<ParcelMessage> = yield events.map(({ args: [message] }) => message);

      yield messages.receive({ type: "ready" });

      ready();

      while (true) {
        let message = yield messages.receive();
        parcelProcess.mailbox.send(message);
      }
    });
  }

  receive(pattern: unknown = undefined): Operation {
    return this.mailbox.receive(pattern);
  }
}
