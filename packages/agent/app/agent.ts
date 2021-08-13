import { parse } from 'bowser';
import { QueryParams } from './query-params';
import { createAgent as createAgentConnection } from '../shared/agent';
import { AgentProtocol } from '../shared/protocol';
import { run } from './runner';
import { Operation } from 'effection';

export function* createAgent(queryParams: QueryParams): Operation<void> {
  console.log('[agent] connecting to', queryParams.connectTo);

  let socket = new WebSocket(queryParams.connectTo);
  let agent: AgentProtocol = yield createAgentConnection(socket, {
    agentId: queryParams.agentId,
    data: parse(navigator.userAgent) as unknown as Record<string, unknown>,
  });

  console.debug('[agent] waiting for messages');

  yield agent.forEach(function*(command) {
    console.log('[agent] received command', command);

    if (command.type === "run") {
      yield run(agent, command);
    }
  });

  console.debug('[agent] complete');
}
