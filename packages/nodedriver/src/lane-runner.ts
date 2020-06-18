import { TestEvent } from '@bigtest/agent';
import { Operation, fork } from 'effection';
import { fetch } from '@effection/fetch';
import { main } from '@effection/node';
import { once } from '@effection/events';
import { TestImplementation, ErrorDetails, Context as TestContext } from '@bigtest/suite';

import { timebox } from './timebox';

main(function*(): Operation<void> {
  send({ ready: true });
  let [message] = yield once(process, 'message');
  // console.log(`[nodeagent:lane<${process.pid}>] received command`, message);

  if (message.type === 'run') {
    let bundle: TestImplementation = yield fetchTestBundle(message.manifestUrl);
    let report = (message: any) => send({...message, testRunId: message.testRunId });
    yield runTest(report, bundle, {}, message.path.slice(1));
  }
});

function send(event: TestEvent | { ready: true }) {
  if (process.send) {
    process.send(event);
  } else {
    throw new Error('lane runner can only be invoked when connected to a parent process');
  }
}

function* fetchTestBundle(url: string): Operation<TestImplementation> {
  let response: Response = yield fetch(url);
  let source: string = yield response.text();

  let parcelRequire = null;
  let exports = {};
  let module = { exports };
  eval(source);
  return module.exports as TestImplementation;
}

function* runTest(report: Report, test: TestImplementation, context: TestContext, path: string[], prefix: string[] = []): Operation<void> {
  let currentPath = prefix.concat(test.description);

  report({ type: 'test:running', path: currentPath })

  for(let step of test.steps) {
    let stepPath = currentPath.concat(step.description);
    try {
      report({ type: 'step:running', path: stepPath });

      let result: TestContext | void = yield timebox(step.action(context), 2000)

      if (result != null) {
        context = {...context, ...result};
      }
      report({ type: 'step:result', status: 'ok', path: stepPath });
    } catch(error) {
      if (error.name === 'TimeoutError') {
        report({
          type: 'step:result',
          status: 'failed',
          timeout: true,
          path: stepPath
        })
      } else {
        report({
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
          report({ type: 'assertion:running', path: assertionPath });

          yield timebox(assertion.check(context), 2000)

          report({ type: 'assertion:result', status: 'ok', path: assertionPath });
        } catch(error) {
          report({ type: 'assertion:result', status: 'failed', error: serializeError(error), path: assertionPath });
        }
      });
    }
  }

  if (path.length > 0) {
    for (let child of test.children) {
      if (child.description === path[0]) {
        yield runTest(report, child, context, path.slice(1), currentPath);
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

interface Report {
  (event: any): void
}
