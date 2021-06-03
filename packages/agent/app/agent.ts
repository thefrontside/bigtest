import { parse } from 'bowser';
import { QueryParams } from './query-params';
import { Agent } from '../shared/agent';
import { run } from './runner';
import { Operation } from '../node_modules/effection';
import { Run } from '../shared/protocol';

export function* createAgent(queryParams: QueryParams): Operation<void> {
  console.log('[agent] connecting to', queryParams.connectTo);

  let createSocket = () => new WebSocket(queryParams.connectTo);
  let agent: Agent = yield Agent.start({
    createSocket,
    agentId: queryParams.agentId,
    data: parse(navigator.userAgent)
  });

  yield agent.commands.forEach(function*(command: Run)  {
    console.log('[agent] received command', command);

    if (command.type === "run") {
      yield run(agent, command);
    }
  });

  console.debug('[agent] complete');
}
