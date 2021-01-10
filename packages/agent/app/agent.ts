import { parse } from 'bowser';
import { QueryParams } from './query-params';
import { Agent } from '../shared/agent';
import { run } from './runner';
import { Controller, Operation, OperationFn, Sequence } from 'effection';

// union of values that is yielded from createAgent
type CreateAgentValue = Operation<Agent> | OperationFn<void> | Sequence<void> | PromiseLike<void> | Controller<void>;

export function* createAgent(queryParams: QueryParams): Generator<CreateAgentValue, void, Agent> {
  console.log('[agent] connecting to', queryParams.connectTo);

  let createSocket = () => new WebSocket(queryParams.connectTo);
  let agent: Agent = yield Agent.start({
    createSocket,
    agentId: queryParams.agentId,
    data: parse(navigator.userAgent)
  });

  yield agent.commands.forEach(function*(command) {
    console.log('[agent] received command', command);

    if (command.type === "run") {
      yield run(agent, command);
    }
  });

  console.debug('[agent] complete');
}
