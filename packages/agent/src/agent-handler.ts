import { Operation, spawn } from 'effection';
import { express, Socket, CloseEvent } from '@bigtest/effection-express';

import { Channel } from '@effection/channel';
import { createSubscription, subscribe, ChainableSubscription } from '@effection/subscription';

import { TestEvent, AgentEvent, Command, Connect } from '../shared/protocol';

export interface AgentConnection {
  /**
   * identifier of the connected agent
   */
  agentId: string;

  /**
   * send a command to the agent;
   */
  send(command: Command): void;

  /**
   * events raised by the agent will be published
   * to this channel.
   */
  events: Channel<TestEvent, CloseEvent>;

  /**
   * Additional metadata about the agent
   */
  data: Record<string, unknown>;
}

let agentIdCounter = 1;

export function generateAgentId(): string {
  return `agent.${agentIdCounter++}`;
}

/**
 * Create an `AgentHandler` resource that is accepting websocket
 * connections on `port`
 */
export function* createAgentHandler(port: number): Operation<ChainableSubscription<AgentConnection, undefined>> {
  let app = express();

  return yield createSubscription<AgentConnection, void>(function* (publish) {
    yield app.ws('*', function*(socket: Socket): Operation<void> {

      let commands = new Channel<Command>();
      yield spawn(subscribe(commands).forEach(command => socket.send(command)));

      let events = new Channel<TestEvent, CloseEvent>();
      let send = (command: Command) => commands.send(command);

      let incoming: ChainableSubscription<AgentEvent, CloseEvent> = yield subscribe(socket);

      let connect: Connect = yield incoming.expect();

      let agentId = connect.agentId || generateAgentId();

      publish({ agentId, send, events, data: connect.data });

      // forward commands to the socket
      try {
        let close: CloseEvent = yield incoming.forEach(function*(data) {
          if(data.type != 'connected') {
            events.send({ agentId, ...data });
          }
        });
        events.close(close);
      } finally {
        events.close({code: 1005, reason: "agent shutdown"});
      }
    });

    yield app.listen(port);

    yield;
  });
}
