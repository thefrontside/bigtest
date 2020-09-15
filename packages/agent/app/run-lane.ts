import { Operation, fork, spawn } from 'effection';
import { on } from '@effection/events';
import { bigtestGlobals } from '@bigtest/globals';
import { TestImplementation, Context as TestContext } from '@bigtest/suite';

import { TestEvent } from '../shared/protocol';

import { findIFrame } from './find-iframe';
import { LaneConfig } from './lane-config';
import { loadManifest } from './manifest';
import { timebox } from './timebox';
import { serializeError } from './serialize-error';
import { wrapConsole } from './wrap-console';
import { setLogConfig, getLogConfig } from './log-config';
import { clearPersistentStorage } from './clear-persistent-storage';

interface TestEvents {
  send(event: TestEvent): void;
}

export function* runLane(config: LaneConfig) {
  setLogConfig({ events: [] });

  let { events, command, path } = config;
  let { testRunId, manifestUrl, appUrl, stepTimeout } = command;

  let context: TestContext = {};

  let originalConsole = wrapConsole((message) => getLogConfig()?.events.push({ type: 'message', occurredAt: new Date().toString(), message }))

  try {
    yield spawn(
      on(window, 'error').map(([e]) => e as ErrorEvent).forEach(function*(event) {
        getLogConfig()?.events.push({ type: 'error', occurredAt: new Date().toString(), error: yield serializeError(event.error) });
      })
    );

    bigtestGlobals.appUrl = appUrl;
    bigtestGlobals.testFrame = findIFrame('app-frame');

    yield clearPersistentStorage();

    let test: TestImplementation = yield loadManifest(manifestUrl);
    yield runLaneSegment(test, path.slice(1), [], stepTimeout)
  } finally {
    events.close();
  }

  function *runLaneSegment(
    test: TestImplementation,
    remainingPath: string[],
    prefix: string[],
    stepTimeout: number
  ): Operation<void> {
    let currentPath = prefix.concat(test.description);

    originalConsole.debug('[agent] running test', currentPath);
    events.send({ testRunId, type: 'test:running', path: currentPath })

    if (bigtestGlobals.defaultInteractorTimeout >= stepTimeout) {
      originalConsole.warn(`[agent] the interactor timeout should be less than, but is greater than or equal to, the step timeout of ${stepTimeout}`);
    }

    for(let step of test.steps) {
      let stepPath = currentPath.concat(step.description);
      try {
        originalConsole.debug('[agent] running step', step);
        events.send({ testRunId, type: 'step:running', path: stepPath });

        let result: TestContext | void = yield timebox(step.action(context), stepTimeout)

        if (result != null) {
          context = {...context, ...result};
        }
        events.send({
          testRunId,
          type: 'step:result',
          status: 'ok',
          path: stepPath
        });
      } catch(error) {
        originalConsole.error('[agent] step failed', step, error);
        if (error.name === 'TimeoutError') {
          events.send({
            testRunId,
            type: 'step:result',
            status: 'failed',
            timeout: true,
            path: stepPath,
            logEvents: getLogConfig()?.events,
          })
        } else {
          events.send({
            testRunId,
            type: 'step:result',
            status: 'failed',
            timeout: false,
            error: yield serializeError(error),
            path: stepPath,
            logEvents: getLogConfig()?.events,
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
            originalConsole.debug('[agent] running assertion', assertion);
            events.send({ testRunId, type: 'assertion:running', path: assertionPath });

            yield timebox(assertion.check(context), stepTimeout)

            events.send({
              testRunId,
              type: 'assertion:result',
              status: 'ok',
              path: assertionPath
            });
          } catch(error) {
            originalConsole.error('[agent] assertion failed', assertion, error);
            events.send({
              testRunId,
              type: 'assertion:result',
              status: 'failed',
              error: yield serializeError(error),
              path: assertionPath,
              logEvents: getLogConfig()?.events,
            });
          }
        });
      }
    }

    if (remainingPath.length > 0) {
      for (let child of test.children) {
        if (child.description === remainingPath[0]) {
          yield runLaneSegment(child, remainingPath.slice(1), currentPath, stepTimeout);
        }
      }
    }
  }
}
