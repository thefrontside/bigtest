import { Operation, spawn, timeout } from 'effection';
import { readyResource } from '@bigtest/effection';
import { express, Socket } from '@bigtest/effection-express';

import { Channel } from '@effection/channel';
import { forEach } from '@effection/subscription';

import { AgentEvent, Command } from '../shared/protocol';

export interface AgentHandler {
  /**
   * Whenever an agent connects to this agent handler over
   * websocket, the agent connection will be publihed to this
   * channel.
   */
  connections: Channel<AgentConnection>;
}

export interface AgentConnection {
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
export function* createAgentHandler(port: number): Operation<AgentHandler> {
  let ids = 1;
  let app = express();
  let connections = new Channel<AgentConnection>();

  return yield readyResource({ connections }, function*(ready) {
    yield app.ws('*', function*(socket: Socket): Operation<void> {
      let agentId = `agent.${ids++}`;

      let commands = new Channel<Command>();
      let events = new Channel<AgentEvent>();
      let send = (command: Command) => commands.send(command);

      connections.send({ send, events });

      // forward commands to the socket
      yield spawn(forEach(commands, command => socket.send(command)));

      // publish all data received from the socket to the `events` channel
      // asynchronously
      yield spawn(forEach(socket, function*(data) {
        yield timeout(0);
        events.send({ agentId, ...data });
      }));

      try {
        yield;
      } finally {
        events.close();
      }
    });

    yield app.listen(port);

    ready();

    try {
      yield;
    } finally {
      connections.close();
    }
  });
}
