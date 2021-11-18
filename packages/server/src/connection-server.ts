import { Resource, spawn } from 'effection';
import { express, Express } from '@bigtest/effection-express';
import { createDuplexChannel, DuplexChannel } from '@effection/duplex-channel';
import { Slice } from '@effection/atom';
import { ConnectionServerStatus, AgentState } from './orchestrator/state';
import { createAgentHandler, Command, TestEvent } from '@bigtest/agent';

export type Incoming = TestEvent & { agentId: string };
export type Outgoing = Command & { agentId: string };

export type ConnectionChannel = DuplexChannel<Incoming, Outgoing>;

interface ConnectionServerOptions {
  status: Slice<ConnectionServerStatus>;
  agents: Slice<Record<string, AgentState>>;
  port: number;
  proxyPort: number;
  manifestPort: number;
};

export interface ConnectionServer {
  channel: ConnectionChannel;
}

export function createConnectionServer(options: ConnectionServerOptions): Resource<ConnectionServer> {
  return {
    labels: {
      name: 'connectionServer',
      port: options.port,
    },
    *init() {
      let [external, internal] = createDuplexChannel<Incoming, Outgoing>();

      yield spawn(function*() {
        options.status.set({ type: 'starting' });

        let app: Express = yield express();

        app.ws('*', createAgentHandler(function*(connection) {
          console.log(`[connection] connected ${connection.agentId}`);
          let agent = options.agents.slice(connection.agentId);

          agent.set({ ...connection.data, agentId: connection.agentId });

          yield spawn(internal.match({ agentId: connection.agentId }).forEach((message) => function*() {
            console.debug('[connection] sending message to agent', connection.agentId, message);
            yield connection.send(message);
          }));

          let { code, reason }: CloseEvent = yield connection.forEach((message) => {
            console.debug('[connection] got message from agent', connection.agentId, message);
            internal.send({ ...message, agentId: connection.agentId });
          });

          console.log(`[connection] disconnected ${connection.agentId} [${code}${reason ? `: ${reason}` : ''}]`);

          agent.remove();
        }));

        yield app.listen(options.port);

        options.status.set({ type: 'started' });

        yield;
      });

      return { channel: external };
    }
  }
}
