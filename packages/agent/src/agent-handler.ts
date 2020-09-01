import { Operation, spawn } from 'effection';
import { express, Socket } from '@bigtest/effection-express';

import { Channel } from '@effection/channel';
import { createSubscription, subscribe, ChainableSubscription } from '@effection/subscription';

import { AgentEvent, Command, Connect } from '../shared/protocol';

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
  events: Channel<AgentEvent>;
}

/**
 * Create an `AgentHandler` resource that is accepting websocket
 * connections on `port`
 */
export function* createAgentHandler(port: number): Operation<ChainableSubscription<AgentConnection, undefined>> {
  let ids = 1;
  let app = express();

  return yield subscribe(createSubscription<AgentConnection, void>(function* (publish) {
    yield app.ws('*', function*(socket: Socket): Operation<void> {

      let commands = new Channel<Command>();
      yield spawn(subscribe(commands).forEach(command => socket.send(command)));


      let events = new Channel<AgentEvent>();
      let send = (command: Command) => commands.send(command);

      let incoming: ChainableSubscription<AgentEvent, undefined> = yield subscribe(socket);

      let connect: Connect = yield incoming.expect();

      let agentId = connect.agentId || `agent.${ids++}`;

      publish({ agentId, send, events });

      // forward commands to the socket
      try {
        yield incoming.forEach(function*(data) {
          events.send({ agentId, ...data });
        });
      } finally {
        events.close();
      }
    });

    yield app.listen(port);

    yield;
  }));
}
