import { createStream, Task, Resource, spawn, ensure } from 'effection';
import { on, once } from '@effection/events';
import { AgentProtocol, AgentEvent, Command } from './protocol';

export * from './protocol';

export interface AgentOptions {
  agentId?: string;
  data?: Record<string, unknown>;
}

export function createAgent(socket: Socket & EventTarget, options: AgentOptions): Resource<AgentProtocol> {
  return {
    *init() {
      let subscription = yield createStream<Command, CloseEvent>(function*(publish) {
        yield spawn(on(socket, 'message')
          .map((event) => event as MessageEvent)
          .map(event => JSON.parse(event.data) as Command)
          .forEach(publish));

        let closed = yield once(socket, 'close');
        return closed;
      });

      function send(message: AgentEvent): void {
        socket.send(JSON.stringify({ ...message, agentId: options.agentId }));
      }

      yield ensure(() => { socket.close() });
      yield spawn(function*() {
        let event: CloseEvent = yield once(socket, 'close');
        if(!event.wasClean) {
          throw new Error(`[agent] socket closed unexpectedly: [${event.code}] ${event.reason}`);
        }
      });

      yield once(socket, 'open');

      send({
        type: 'connected',
        agentId: options.agentId,
        data: options.data || {},
      });

      return { ...subscription, send };
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
