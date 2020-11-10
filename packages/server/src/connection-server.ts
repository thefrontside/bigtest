import { Operation, spawn } from 'effection';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import { Mailbox } from '@bigtest/effection';
import { Atom } from '@bigtest/atom';
import { OrchestratorState } from './orchestrator/state';
import { AgentConnection, createAgentHandler, Command, TestEvent } from '@bigtest/agent';

interface ConnectionServerOptions {
  inbox: Mailbox<Command>;
  delegate: Mailbox;
  atom: Atom<OrchestratorState>;
  port: number;
  proxyPort: number;
  manifestPort: number;
};

export function* createConnectionServer(options: ConnectionServerOptions): Operation {
  let handler: ChainableSubscription<AgentConnection, void> = yield createAgentHandler(options.port);

  options.delegate.send({ status: "ready" });

  while(true) {
    let connection: AgentConnection = yield handler.expect();
    yield spawn(function*() {
      console.log(`[connection] connected ${connection.agentId}`);
      let agent = options.atom.slice()('agents', connection.agentId);

      agent.set({ ...connection.data, agentId: connection.agentId });

      yield spawn(function*(): Operation<void> {
        while (true) {
          let message = yield options.inbox.receive({ agentId: connection.agentId });
          console.debug('[connection] sending message to agent', connection.agentId, message);
          connection.send(message);
        }
      });

      let { code, reason }: CloseEvent = yield subscribe(connection.events).forEach(function*(message: TestEvent) {
        console.debug('[connection] got message from agent', connection.agentId, message);
        options.delegate.send({ ...message, agentId: connection.agentId });
      });

      console.debug(`[connection] disconnected ${connection.agentId} [${code}${reason ? `: ${reason}` : ''}]`);

      agent.remove();
    });
  }
}
