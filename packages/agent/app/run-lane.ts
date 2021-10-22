import { Operation, spawn, all, withTimeout } from 'effection';
import { on } from '@effection/events';
import { bigtestGlobals } from '@bigtest/globals';
import { globals, setInteractionWrapper } from '@interactors/globals';
import { TestImplementation, Context as TestContext } from '@bigtest/suite';

import { findIFrame } from './find-iframe';
import { LaneConfig } from './lane-config';
import { loadManifest } from './manifest';
import { serializeError } from './serialize-error';
import { wrapConsole } from './wrap-console';
import { setLogConfig, getLogConfig } from './log-config';
import { clearPersistentStorage } from './clear-persistent-storage';
import { addCoverageMap } from './coverage';

export function* runLane(config: LaneConfig): Operation<TestImplementation> {
  function* runLaneSegment(
    test: TestImplementation,
    remainingPath: string[],
    prefix: string[],
    stepTimeout: number
  ): Operation<void> {
    let currentPath = prefix.concat(test.description);

    originalConsole.debug('[agent] running test', currentPath);
    events.send({ testRunId, type: 'test:running', path: currentPath })

    if (globals.interactorTimeout >= stepTimeout) {
      originalConsole.warn(`[agent] the interactor timeout should be less than, but is greater than or equal to, the step timeout of ${stepTimeout}`);
    }

    for(let [index, step] of test.steps.entries()) {
      let stepPath = currentPath.concat(`${index}:${step.description}`);
      try {
        originalConsole.debug('[agent] running step', step);
        events.send({ testRunId, type: 'step:running', path: stepPath });

        bigtestGlobals.runnerState = 'step';
        let result: TestContext | void = yield withTimeout(stepTimeout, Promise.resolve(step.action(context)));
        bigtestGlobals.runnerState = 'pending';

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

    yield all(test.assertions.map(function*(assertion) {
      let assertionPath = currentPath.concat(assertion.description);
      try {
        originalConsole.debug('[agent] running assertion', assertion);
        events.send({ testRunId, type: 'assertion:running', path: assertionPath });

        bigtestGlobals.runnerState = 'assertion';
        yield withTimeout(stepTimeout, Promise.resolve(assertion.check(context)));
        bigtestGlobals.runnerState = 'pending';

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
    }));

    if (remainingPath.length > 0) {
      for (let child of test.children) {
        if (child.description === remainingPath[0]) {
          yield runLaneSegment(child, remainingPath.slice(1), currentPath, stepTimeout);
        }
      }
    }
  }

  setLogConfig({ events: [] });
  setInteractionWrapper((interaction) => ({
    ...interaction,
    check() {
      throw new Error(`tried to ${interaction.description} in an assertion, actions/perform should only be run in steps`)
    }
  }))

  let { events, command, path } = config;
  let { testRunId, manifestUrl, appUrl, stepTimeout } = command;

  let context: TestContext = {};

  let originalConsole = wrapConsole((message) => getLogConfig()?.events.push({ type: 'message', occurredAt: new Date().toString(), message }))

  try {
    yield spawn(
      on<ErrorEvent>(window, 'error').forEach((event) => function*() {
        getLogConfig()?.events.push({ type: 'error', occurredAt: new Date().toString(), error: yield serializeError(event.error) });
      })
    );

    bigtestGlobals.runnerState = 'pending';
    bigtestGlobals.appUrl = appUrl;
    bigtestGlobals.testFrame = findIFrame('app-frame');

    yield clearPersistentStorage();

    let test: TestImplementation = yield loadManifest(manifestUrl);
    yield runLaneSegment(test, path.slice(1), [], stepTimeout)

    return test;
  } finally {
    addCoverageMap(bigtestGlobals.testFrame);
    events.close();
  }
}
