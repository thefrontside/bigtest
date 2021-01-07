import Bowser from 'bowser';
import { QueryParams } from './query-params';
import { Agent } from '../shared/agent';
import { run } from './runner';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function* createAgent(queryParams: QueryParams) {
  console.log('[agent] connecting to', queryParams.connectTo);

  let createSocket = () => new WebSocket(queryParams.connectTo);
  let agent: Agent = yield Agent.start({
    createSocket,
    agentId: queryParams.agentId,
    data: Bowser.parse(navigator.userAgent)
  });

  yield agent.commands.forEach(function*(command) {
    console.log('[agent] received command', command);

    if (command.type === "run") {
      yield run(agent, command);
    }
  });

  console.debug('[agent] complete');
}
