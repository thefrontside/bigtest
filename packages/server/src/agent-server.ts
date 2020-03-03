import { Operation } from 'effection';
import { AgentServer } from '@bigtest/agent'
import { Mailbox } from '@bigtest/effection';

interface StartAgentServerOptions {
  delegate: Mailbox;
  agentServer: AgentServer;
}

export function *createAgentServer({ delegate, agentServer }: StartAgentServerOptions): Operation {
  yield agentServer.listen();
  delegate.send({ status: 'ready' });
  yield agentServer.join();
}
