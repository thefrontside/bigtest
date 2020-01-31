import BaseAdapter from './base';

const { mocha } = window;

function gatherSuites(test) {
  let suite = test.parent;
  let suites = [];

  while (!suite.root) {
    suites.push(suite.title);
    suite = suite.parent;
  }

  return suites.reverse();
}

function serializeTest(test) {
  return {
    name: test.title,
    path: gatherSuites(test),
    passing: test.state === 'passed',
    failing: test.state === 'failed',
    skipped: test.pending,
    duration: test.duration,
    errors: [test.$error].filter(Boolean)
  };
}

function gatherTests(suite) {
  return [].concat(
    suite.tests.map(serializeTest),
    ...suite.suites.map(gatherTests)
  );
}

const mochaStackReg = /\n.+\/mocha\/mocha\.js\?\w*:[\d:]+\)?(?=(\n|$))/g;

function serializeError(err) {
  let { name, message, stack } = err;

  if (stack) {
    // remove mocha stack entries
    stack = stack.replace(mochaStackReg, '');
  }

  // formatted error
  return { name, message, stack };
}

export default class MochaAdapter extends BaseAdapter {
  init({ ui = 'bdd' } = {}) {
    mocha.setup({ ui });
    mocha.reporter((runner) => {
      runner.on('start', this.handleStart.bind(this));
      runner.on('end', this.handleEnd.bind(this));
      runner.on('test', this.handleTest.bind(this));
      runner.on('test end', this.handleTestEnd.bind(this));
      runner.on('fail', this.handleFail.bind(this));
    });
  }

  get tests() {
    let tests = gatherTests(mocha.suite);
    Object.defineProperty(this, 'tests', { value: tests });
    return tests;
  }

  handleStart() {
    this.send('start', this.tests);
  }

  handleEnd() {
    this.send('end', this.tests);
  }

  handleTest(test) {
    this.send('update', [{
      ...serializeTest(test),
      running: true
    }]);
  }

  handleTestEnd(test) {
    this.send('update', [
      serializeTest(test)
    ]);
  }

  handleFail(runnable, err) {
    runnable.$error = serializeError(err);
    let error = serializeError(err);

    if (runnable.type === 'hook') {
      error.message = `${runnable.originalTitle}: ${error.message}`;

      this.send('update', gatherTests(runnable.parent).map(test => {
        return { ...test, failing: true, errors: [error] };
      }));
    }
  }

  run() {
    mocha.run();
  }
}
