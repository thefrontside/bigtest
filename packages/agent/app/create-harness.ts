import { ParentFrame } from './parent-frame';
import { Test } from './test';

export function* createHarness() {
  console.log('[harness] starting');

  let parentFrame = yield ParentFrame.start();

  while(true) {
    let message = yield parentFrame.receive();

    console.log('[harness] got message', message);

    if(message.type === 'run') {
      let manifest = yield loadManifest(message.manifestUrl) as Test;

      yield runTest(parentFrame, manifest, message.path.slice(1))
    }
  }
}

function *runTest(parentFrame: ParentFrame, test: Test, path: string[], prefix: string[] = []) {
  let currentPath = prefix.concat(test.description);

  for(let step of test.steps) {
    let stepPath = currentPath.concat(step.description);
    try {
      parentFrame.send({ type: 'running', subject: 'step', path: stepPath });
      yield step.action({});

      parentFrame.send({ type: 'result', subject: 'step', status: 'ok', path: stepPath });
    } catch(e) {
      parentFrame.send({ type: 'result', subject: 'step', status: 'error', path: stepPath });
      parentFrame.send({ type: 'done' });
      return;
    }
  }

  for(let assertion of test.assertions) {
    let assertionPath = currentPath.concat(assertion.description);
    try {
      parentFrame.send({ type: 'running', subject: 'assertion', path: assertionPath });

      assertion.check({});

      parentFrame.send({ type: 'result', subject: 'assertion', status: 'ok', path: assertionPath });
    } catch(e) {
      parentFrame.send({ type: 'result', subject: 'assertion', status: 'error', path: assertionPath });
      parentFrame.send({ type: 'done' });
      return;
    }
  }

  if(path.length === 0) {
    parentFrame.send({ type: 'done' });
  } else {
    for(let child of test.children) {
      if(child.description === path[0]) {
        yield runTest(parentFrame, child, path.slice(1), currentPath);
      }
    }
  }
}

function loadManifest(manifestUrl) {
  return ({ resume, ensure }) => {
    let scriptElement = document.createElement('script') as HTMLScriptElement;
    let listener = () => {
      resume(__bigtestManifest);
    }

    scriptElement.addEventListener('load', listener)
    ensure(() => { scriptElement.removeEventListener('load', listener) };

    scriptElement.src = manifestUrl;
    document.head.appendChild(scriptElement);
  }
}
