import { Operation, fork } from 'effection';
import { bigtestGlobals } from '@bigtest/globals';
import { TestImplementation, Context as TestContext } from '@bigtest/suite';

import { TestEvent } from '../shared/protocol';

import { findIFrame } from './find-iframe';
import { LaneConfig } from './lane-config';
import { loadManifest } from './manifest';
import { timebox } from './timebox';
import { serializeError } from './serialize-error';

interface TestEvents {
  send(event: TestEvent): void;
}

export function* runLane(config: LaneConfig) {
  let { events, command, path } = config;
  try {
    let { testRunId, manifestUrl, appUrl } = command;
    bigtestGlobals.appUrl = appUrl;
    bigtestGlobals.testFrame = findIFrame('app-frame');
    let test: TestImplementation = yield loadManifest(manifestUrl);
    yield runLaneSegment(testRunId, events, test, {}, path.slice(1), [])
  } finally {
    events.close();
  }
}

const stepTimeout = 60_000;

function *runLaneSegment(testRunId: string, events: TestEvents, test: TestImplementation, context: TestContext, remainingPath: string[], prefix: string[]): Operation<void> {
  let currentPath = prefix.concat(test.description);

  console.debug('[agent] running test', currentPath);
  events.send({ testRunId, type: 'test:running', path: currentPath })

  if (bigtestGlobals.defaultInteractorTimeout >= stepTimeout) {
    console.warn(`[agent] the interactor timeout should be less than, but is greater than or equal to, the step timeout of ${stepTimeout}`);
  }

  for(let step of test.steps) {
    let stepPath = currentPath.concat(step.description);
    try {
      console.debug('[agent] running step', step);
      events.send({ testRunId, type: 'step:running', path: stepPath });

      let result: TestContext | void = yield timebox(step.action(context), stepTimeout)

      if (result != null) {
        context = {...context, ...result};
      }
      events.send({ testRunId, type: 'step:result', status: 'ok', path: stepPath });
    } catch(error) {
      console.error('[agent] step failed', step, error);
      if (error.name === 'TimeoutError') {
        events.send({
          testRunId,
          type: 'step:result',
          status: 'failed',
          timeout: true,
          path: stepPath
        })
      } else {
        events.send({
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
          events.send({ testRunId, type: 'assertion:running', path: assertionPath });

          yield timebox(assertion.check(context), stepTimeout)

          events.send({ testRunId, type: 'assertion:result', status: 'ok', path: assertionPath });
        } catch(error) {
          console.error('[agent] assertion failed', assertion, error);
          events.send({ testRunId, type: 'assertion:result', status: 'failed', error: yield serializeError(error), path: assertionPath });
        }
      });
    }
  }

  if (remainingPath.length > 0) {
    for (let child of test.children) {
      if (child.description === remainingPath[0]) {
        yield runLaneSegment(testRunId, events, child, context, remainingPath.slice(1), currentPath);
      }
    }
  }
}
