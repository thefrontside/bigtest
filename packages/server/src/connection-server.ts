import { Operation, spawn, resource } from 'effection';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { createDuplexChannel, DuplexChannel } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';
import { AgentConnection, createAgentHandler, Command, TestEvent } from '@bigtest/agent';

export type Incoming = TestEvent & { agentId: string };
export type Outgoing = Command & { agentId: string };

export type ConnectionChannel = DuplexChannel<Outgoing, Incoming>;

interface ConnectionServerOptions {
  atom: Atom<OrchestratorState>;
  port: number;
  proxyPort: number;
  manifestPort: number;
};

interface ConnectionServer {
  channel: ConnectionChannel;
}

export function* createConnectionServer(options: ConnectionServerOptions): Operation<ConnectionServer> {
  let [tx, rx] = createDuplexChannel<Outgoing, Incoming>({ maxListeners: 100000 });

  return yield resource({ channel: tx }, function*() {
    let handler: ChainableSubscription<AgentConnection, void> = yield createAgentHandler(options.port);
    let statusSlice = options.atom.slice('connectionService', 'status');

    statusSlice.set({ type: 'ready' });

    while(true) {
      let connection: AgentConnection = yield handler.expect();
      yield spawn(function*() {
        console.log(`[connection] connected ${connection.agentId}`);
        let agent = options.atom.slice('agents', connection.agentId);

        agent.set({ ...connection.data, agentId: connection.agentId });

        yield spawn(rx.match({ agentId: connection.agentId }).forEach(function*(message) {
          console.debug('[connection] sending message to agent', connection.agentId, message);
          connection.send(message);
        }));

        let { code, reason }: CloseEvent = yield subscribe(connection.events).forEach(function*(message: TestEvent) {
          console.debug('[connection] got message from agent', connection.agentId, message);
          rx.send({ ...message, agentId: connection.agentId });
        });

        console.debug(`[connection] disconnected ${connection.agentId} [${code}${reason ? `: ${reason}` : ''}]`);

        agent.remove();
      });
    }
  });
}
