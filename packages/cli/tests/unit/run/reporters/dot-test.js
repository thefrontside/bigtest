import { describe, beforeEach, it } from 'mocha';
import { WritableStream } from 'memory-streams';
import { expect, dedent } from '@tests/helpers';

import DotReporter from '@run/reporters/dot';
import create from '@run/state/create';
import Test from '@run/state/test';

describe('Unit: Reporters - dot', () => {
  let reporter, output, tests;

  beforeEach(() => {
    reporter = new DotReporter({
      out: (output = new WritableStream()),
      colors: false
    });

    tests = [
      create(Test, {
        name: 'test 1',
        path: ['First'],
        browser: 'chrome'
      }),
      create(Test, {
        name: 'test 2',
        path: ['First'],
        browser: 'chrome'
      }),
      create(Test, {
        name: 'test 1',
        path: ['Second'],
        browser: 'chrome'
      })
    ];
  });

  it('prints a new line on test start', () => {
    reporter.onStart(tests);
    expect(output.toString()).to.equal('\n');
  });

  it('prints "." for passing tests on update', () => {
    reporter.onUpdate(tests[0].update({ browser: 'chrome', passing: true }));
    expect(output.toString()).to.equal('.');
  });

  it('prints "F" for failing tests on update', () => {
    reporter.onUpdate(tests[0].update({ browser: 'chrome', failing: true }));
    expect(output.toString()).to.equal('F');
  });

  it('prints "," for skipped tests on update', () => {
    reporter.onUpdate(tests[0].update({ browser: 'chrome', skipped: true }));
    expect(output.toString()).to.equal(',');
  });

  it('prints a summary when tests end', () => {
    reporter.onEnd([
      tests[0].update({ browser: 'chrome', passing: true, duration: 10 }),
      tests[1].update({ browser: 'chrome', passing: true, duration: 20 }),
      tests[2].update({ browser: 'chrome', skipped: true })
    ]);

    expect(output.toString()).to.equal(dedent`
      \n
      2 passing 30ms
      1 skipped
      \n
    `);
  });

  it('prints errors when tests end with failures', () => {
    let error = new Error('test');

    reporter.onEnd([
      tests[0].update({ browser: 'chrome', passing: true, duration: 10 }),
      tests[1].update({ browser: 'chrome', skipped: true }),
      tests[2].update({ browser: 'chrome', failing: true, errors: [error], duration: 2000 })
    ]);

    let stack = error.stack
    // remove the first line and following newline
      .replace(/^.*\n\s*/, '')
    // escape newlines and indent the stack
      .replace(/\n\s*/g, '\\n    ');

    expect(output.toString()).to.equal(dedent`
      \n
      1 passing 2010ms
      1 failing
      1 skipped

      FAILED TESTS:
      Second
        1) test 1

        Error: test
          ${stack}
      \n
    `);
  });

  it('prints browser names with errors with multiple browser tests', () => {
    let chrome = new Error('Chrome error');
    let firefox = new Error('Firefox error');

    reporter.onEnd([
      tests[0]
        .update({ browser: 'chrome', passing: true, duration: 10 })
        .update({ browser: 'firefox', passing: true, duration: 15 }),
      tests[1]
        .update({ browser: 'chrome', failing: true, errors: [chrome], duration: 2000 })
        .update({ browser: 'firefox', failing: true, errors: [firefox], duration: 2000 }),
      tests[2]
        .update({ browser: 'chrome', failing: true, errors: [chrome], duration: 2000 })
        .update({ browser: 'firefox', failing: true, errors: [firefox], duration: 2000 })
    ]);

    let cStack = chrome.stack
      .replace(/^.*\n\s*/, '')
      .replace(/\n\s*/g, '\\n    ');
    let ffStack = firefox.stack
      .replace(/^.*\n\s*/, '')
      .replace(/\n\s*/g, '\\n    ');

    expect(output.toString()).to.equal(dedent`
      \n
      1 passing 4015ms
      2 failing

      FAILED TESTS:
      First
        1) test 2

        chrome
        Error: Chrome error
          ${cStack}

        firefox
        Error: Firefox error
          ${ffStack}

      Second
        2) test 1

        chrome
        Error: Chrome error
          ${cStack}

        firefox
        Error: Firefox error
          ${ffStack}
      \n
    `);
  });
});
