import { Operation, resource } from 'effection';
import { Mailbox, subscribe, ensure } from '@bigtest/effection';
import { throwOnErrorEvent, once } from '@effection/events';
import { AgentProtocol, AgentEvent, Command } from './protocol';

export * from './protocol';

export class Agent implements AgentProtocol {
  constructor(private socket: Socket, private mailbox: Mailbox) {}

  static *start(createSocket: () => Socket): Operation<Agent> {
    let mailbox = new Mailbox();

    let socket = createSocket();
    let res = yield resource(new Agent(socket, mailbox), function*() {
      yield subscribe(mailbox, socket, 'message');
      yield ensure(() => socket.close());
      yield throwOnErrorEvent(socket);
      yield once(socket, 'close');
    });

    yield once(socket, 'open');

    return res;
  }

  send(message: AgentEvent) {
    this.socket.send(JSON.stringify(message));
  }

  *receive(): Operation<Command> {
    let { args: [event] } = yield this.mailbox.receive();
    return JSON.parse(event.data);
  }
}

interface Socket extends EventTarget {
  send(message: string): void;
  close(): void;
}
