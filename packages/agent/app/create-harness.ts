import { Operation, fork } from 'effection';
import { once } from '@effection/events';
import { bigtestGlobals } from '@bigtest/globals';
import { TestImplementation, ErrorDetails, Context as TestContext } from '@bigtest/suite';

import { ParentFrame } from './parent-frame';
import { timebox } from './timebox';

export function* createHarness() {
  console.log('[harness] starting');

  let parentFrame = yield ParentFrame.start();

  while(true) {
    let message = yield parentFrame.receive();

    console.info('[harness] got message', message);

    if(message.type === 'run') {
      let manifest: TestImplementation = yield loadManifest(message.manifestUrl);
      let path = message.path.slice(1);
      try {
        parentFrame.send({ type: 'lane:begin', path });
        yield runTest(parentFrame, manifest, {}, path);
      } finally {
        parentFrame.send({ type: 'lane:end', path });
      }
    }
  }
}

const serializeError: (error: ErrorDetails) => ErrorDetails = ({ message, fileName, lineNumber, columnNumber, stack }) => ({
  message,
  fileName,
  lineNumber,
  columnNumber,
  stack
});

function *runTest(parentFrame: ParentFrame, test: TestImplementation, context: TestContext, path: string[], prefix: string[] = []): Operation<void> {
  let currentPath = prefix.concat(test.description);

  console.debug('[harness] running test', currentPath);
  parentFrame.send({ type: 'test:running', path: currentPath })

  for(let step of test.steps) {
    let stepPath = currentPath.concat(step.description);
    try {
      console.debug('[harness] running step', step);
      parentFrame.send({ type: 'step:running', path: stepPath });

      let result: TestContext | void = yield timebox(step.action(context), 2000)

      if (result != null) {
        context = {...context, ...result};
      }
      parentFrame.send({ type: 'step:result', status: 'ok', path: stepPath });
    } catch(error) {
      console.error('[harness] step failed', step, error);
      if (error.name === 'TimeoutError') {
        parentFrame.send({
          type: 'step:result',
          status: 'failed',
          timeout: true,
          path: stepPath
        })
      } else {
        parentFrame.send({
          type: 'step:result',
          status: 'failed',
          timeout: false,
          error: serializeError(error),
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
          console.debug('[harness] running assertion', assertion);
          parentFrame.send({ type: 'assertion:running', path: assertionPath });

          yield timebox(assertion.check(context), 2000)

          parentFrame.send({ type: 'assertion:result', status: 'ok', path: assertionPath });
        } catch(error) {
          console.error('[harness] assertion failed', assertion, error);
          parentFrame.send({ type: 'assertion:result', status: 'failed', error: serializeError(error), path: assertionPath });
        }
      });
    }
  }

  if (path.length > 0) {
    for (let child of test.children) {
      if (child.description === path[0]) {
        yield runTest(parentFrame, child, context, path.slice(1), currentPath);
      }
    }
  }
}

function* loadManifest(manifestUrl: string): Operation<TestImplementation> {
  let scriptElement = document.createElement('script') as HTMLScriptElement;
  scriptElement.src = manifestUrl;
  document.head.appendChild(scriptElement);

  yield once(scriptElement, 'load');

  return bigtestGlobals.manifest;
}
