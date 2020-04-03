import { Operation, monitor } from 'effection';
import { Mailbox, suspend, subscribe, ensure } from '@bigtest/effection';
import { AgentProtocol, AgentEvent, Command } from './protocol';

export * from './protocol';

export class Agent implements AgentProtocol {
  constructor(private socket: Socket, private mailbox: Mailbox) {}

  static *start(socket: Socket): Operation<Agent> {
    let mailbox = new Mailbox();

    yield suspend(subscribe(mailbox, socket, ['open', 'message', 'close', 'error']));
    yield suspend(monitor(function*() {
      let { args: [error] } = yield mailbox.receive({ event: 'error' });
      throw error as Error;
    }));
    yield mailbox.receive({ event: 'open' });
    yield suspend(ensure(() => socket.close()));

    return new Agent(socket, mailbox);
  }

  send(message: AgentEvent) {
    this.socket.send(JSON.stringify(message));
  }

  *receive(): Operation<Command> {
    let { args: [event] } = yield this.mailbox.receive({ event: 'message' });
    return JSON.parse(event.data);
  }
}

interface Socket extends EventTarget {
  send(message: string): void;
  close(): void;
}
