import { ParentFrame } from './parent-frame';
import { TestImplementation } from '@bigtest/suite';

declare const __bigtestManifest: TestImplementation;

export function* createHarness() {
  console.log('[harness] starting');

  let parentFrame = yield ParentFrame.start();

  while(true) {
    let message = yield parentFrame.receive();

    console.info('[harness] got message', message);

    if(message.type === 'run') {
      let manifest: TestImplementation = yield loadManifest(message.manifestUrl);

      try {
        parentFrame.send({ type: 'lane:begin' });
        yield runTest(parentFrame, manifest, message.path.slice(1))
      } finally {
        parentFrame.send({ type: 'lane:end' });
      }
    }
  }
}

function serializeError({ message, fileName, lineNumber, columnNumber, stack }) {
  return { message, fileName, lineNumber, columnNumber, stack };
}

function *runTest(parentFrame: ParentFrame, test: TestImplementation, path: string[], prefix: string[] = []) {
  let currentPath = prefix.concat(test.description);

  console.debug('[harness] running test', currentPath);
  parentFrame.send({ type: 'test:running', path: currentPath })

  for(let step of test.steps) {
    let stepPath = currentPath.concat(step.description);
    try {
      console.debug('[harness] running step', step);
      parentFrame.send({ type: 'step:running', path: stepPath });
      yield step.action({});

      parentFrame.send({ type: 'step:result', status: 'ok', path: stepPath });
    } catch(error) {
      console.error('[harness] step failed', step, error);
      parentFrame.send({ type: 'step:result', status: 'failed', error: serializeError(error), path: stepPath });
      return;
    }
  }

  for(let assertion of test.assertions) {
    let assertionPath = currentPath.concat(assertion.description);
    try {
      console.debug('[harness] running assertion', assertion);
      parentFrame.send({ type: 'assertion:running', path: assertionPath });

      assertion.check({});

      parentFrame.send({ type: 'assertion:result', status: 'ok', path: assertionPath });
    } catch(error) {
      console.error('[harness] assertion failed', assertion, error);
      parentFrame.send({ type: 'assertion:result', status: 'failed', error: serializeError(error), path: assertionPath });
    }
  }

  if (path.length > 0) {
    for (let child of test.children) {
      if (child.description === path[0]) {
        yield runTest(parentFrame, child, path.slice(1), currentPath);
      }
    }
  }
}

function loadManifest(manifestUrl: string) {
  return ({ resume, ensure }) => {
    let scriptElement = document.createElement('script') as HTMLScriptElement;
    let listener = () => {
      resume(__bigtestManifest);
    }

    scriptElement.addEventListener('load', listener)
    ensure(() => { scriptElement.removeEventListener('load', listener) });

    scriptElement.src = manifestUrl;
    document.head.appendChild(scriptElement);
  }
}
