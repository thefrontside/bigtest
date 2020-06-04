import { Operation } from 'effection';
import { AgentServerConfig } from '@bigtest/agent'
import { Mailbox } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';

interface StartAgentServerOptions {
  delegate: Mailbox;
  agentServerConfig: AgentServerConfig;
}

export function *createAgentServer({ delegate, agentServerConfig }: StartAgentServerOptions): Operation {
  let app = express();

  app.use(staticMiddleware(agentServerConfig.appDir()));

  yield app.listen(agentServerConfig.options.port);

  delegate.send({ status: 'ready' });

  yield;
}
