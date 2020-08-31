import { Operation, fork } from 'effection';
import { TestImplementation, Context as TestContext } from '@bigtest/suite';

import { timebox } from './timebox';
import { serializeError } from './serialize-error';
import { Agent } from '../shared/agent';

export function *runLane(testRunId: string, agent: Agent, test: TestImplementation, path: string[]): Operation<void> {
  return yield runLaneSegment(testRunId, agent, test, {}, path.slice(1), []);
}

function *runLaneSegment(testRunId: string, agent: Agent, test: TestImplementation, context: TestContext, remainingPath: string[], prefix: string[]): Operation<void> {
  let currentPath = prefix.concat(test.description);

  console.debug('[agent] running test', currentPath);
  agent.send({ testRunId, type: 'test:running', path: currentPath })

  for(let step of test.steps) {
    let stepPath = currentPath.concat(step.description);
    try {
      console.debug('[agent] running step', step);
      agent.send({ testRunId, type: 'step:running', path: stepPath });

      let result: TestContext | void = yield timebox(step.action(context), 2000)

      if (result != null) {
        context = {...context, ...result};
      }
      agent.send({ testRunId, type: 'step:result', status: 'ok', path: stepPath });
    } catch(error) {
      console.error('[agent] step failed', step, error);
      if (error.name === 'TimeoutError') {
        agent.send({
          testRunId,
          type: 'step:result',
          status: 'failed',
          timeout: true,
          path: stepPath
        })
      } else {
        agent.send({
          testRunId,
          type: 'step:result',
          status: 'failed',
          timeout: false,
          error: yield serializeError(error),
          path: stepPath
        });
      }
      return;
    }
  }

  yield function*() {
    for(let assertion of test.assertions) {
      yield fork(function*() {
        let assertionPath = currentPath.concat(assertion.description);
        try {
          console.debug('[agent] running assertion', assertion);
          agent.send({ testRunId, type: 'assertion:running', path: assertionPath });

          yield timebox(assertion.check(context), 2000)

          agent.send({ testRunId, type: 'assertion:result', status: 'ok', path: assertionPath });
        } catch(error) {
          console.error('[agent] assertion failed', assertion, error);
          agent.send({ testRunId, type: 'assertion:result', status: 'failed', error: yield serializeError(error), path: assertionPath });
        }
      });
    }
  }

  if (remainingPath.length > 0) {
    for (let child of test.children) {
      if (child.description === remainingPath[0]) {
        yield runLaneSegment(testRunId, agent, child, context, remainingPath.slice(1), currentPath);
      }
    }
  }
}
