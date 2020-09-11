import { Operation, resource, spawn } from 'effection';
import { on, once } from '@effection/events';
import { createSubscription } from '@effection/subscription';
import { AgentProtocol, AgentEvent, Command } from './protocol';

export * from './protocol';

export interface AgentOptions {
  agentId?: string;
  data: unknown;
  createSocket: () => Socket;
}

export class Agent implements AgentProtocol {
  constructor(private socket: Socket & EventTarget, private options: AgentOptions) {}

  /**
   * Produces an Agent resource that is connected to an orchestrator. This resource can be
   * used to receive commands from the orchestrator and send events back.
   */
  static *start(options: AgentOptions): Operation<Agent> {

    let socket = options.createSocket() as unknown as (Socket & EventTarget);
    let agent = yield resource(new Agent(socket, options), function*(): Operation<void> {
      try {
        let [event] = yield once(socket, 'close');
        if(!event.wasClean) {
          throw new Error(`[agent] socket closed unexpectedly: [${event.code}] ${event.reason}`);
        }
      } finally {
        socket.close();
      }
    });

    yield once(socket, 'open');

    agent.send({
      type: 'connected',
      agentId: options.agentId,
      data: options.data
    });

    return agent;
  }

  get commands() {
    let { socket } = this;
    return createSubscription<Command, void>(function*(publish) {
      yield spawn(
        on(socket, 'message')
          .map(([event]) => event as MessageEvent)
          .map(event => JSON.parse(event.data) as Command)
          .forEach(function*(command) {
            publish(command);
          })
      );

      yield once(socket, 'close');
    });
  }

  send(message: AgentEvent) {
    this.socket.send(JSON.stringify({ ...message, agentId: this.options.agentId }));
  }

  *receive(): Operation<Command> {
    let first: Command | undefined = yield this.commands.first();
    if (first) {
      return first;
    } else {
      throw new Error('unexpected end of command stream');
    }
  }
}

export interface Socket extends DOMEventTarget {
  send(message: string): void;
  close(): void;
}

interface DOMEventTarget {
  addEventListener: EventTarget["addEventListener"];
  removeEventListener: EventTarget["removeEventListener"];
}
