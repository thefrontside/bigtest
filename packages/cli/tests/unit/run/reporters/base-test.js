import { describe, beforeEach, it } from 'mocha';
import { WritableStream } from 'memory-streams';
import chalk from 'chalk';

import { expect, dedent } from '@tests/helpers';

import Reporter from '@run/reporters/base';
import State, { create } from '@run/state';

describe('Unit: Reporter', () => {
  let reporter, output;

  beforeEach(() => {
    reporter = new Reporter({
      out: (output = new WritableStream()),
      colors: false
    });
  });

  it('can write to stdout', () => {
    reporter.write('hello', ' ', 'world');
    expect(output.toString()).to.equal('hello world');
  });

  it('can log to output with a new line', () => {
    reporter.log('newline');
    expect(output.toString()).to.equal('newline\n');
  });

  it('can chain writes and logs', () => {
    reporter.write('hello').write(' ').log('world').log('');
    expect(output.toString()).to.equal('hello world\n\n');
  });

  it('can set persistent indentation', () => {
    reporter.log('test').indent(2).log('indented');
    expect(output.toString()).to.equal('test\n  indented\n');
    reporter.write('multiline\nworks', ' too');
    expect(output.toString()).to.equal(dedent`
      test
        indented
        multiline
        works too
    `);
  });

  it('can dedent persisted indentation', () => {
    reporter.indent(2).log('in').dedent().write('out');
    expect(output.toString()).to.equal('  in\nout');
  });

  it('can log errors to output', () => {
    reporter.error('ERROR');
    expect(output.toString()).to.equal('ERROR\n');
  });

  it('can log error objects to output', () => {
    let error = new Error('well @#$%!');
    let { name, message } = error;

    let stack = error.stack
    // the printed stack does not include a message...
      .replace(/^.*\n/, '')
    // ...and has custom indentation defaulting to 2 spaces
      .replace(/^\s*/gm, '  ');

    reporter.error(error);
    expect(output.toString()).to.equal(
      `${name}: ${message}\n${stack}\n`
    );
  });

  it('can customize error stack indentation', () => {
    let error = new Error();

    // same as above, but with an indentation of 4 spaces
    let stack = error
      .stack.replace(/^.*\n/, '')
      .replace(/^\s*/gm, '    ');

    reporter.error(error, 4);
    expect(output.toString()).to.include(stack);
  });

  it('has a local chalk instance toggled by the `colors` property', () => {
    expect(reporter.chalk).to.not.equal(chalk);
    reporter.colors = true;
    expect(reporter.chalk.enabled).to.be.true;
    reporter.colors = false;
    expect(reporter.chalk.enabled).to.be.false;
  });

  it('prints tests grouped and nested under their paths', () => {
    let chrome = { id: '01', browser: 'chrome' };

    let state = create(State)
      .connectBrowser(chrome)
      .updateTests(chrome, [{
        name: 'nested',
        path: ['First', 'and']
      }, {
        name: 'nested sibling',
        path: ['First', 'and']
      }, {
        name: 'deeper nested',
        path: ['First', 'and', 'then']
      }, {
        name: 'not nested',
        path: ['Second']
      }]);

    reporter.printTests(state.tests, (test, i) => {
      reporter.log(test.name);
    });

    expect(output.toString()).to.equal(dedent`
      First
        and
          nested
          nested sibling
          then
            deeper nested
      Second
        not nested

    `);
  });

  describe('initializing with options', () => {
    it('enables or disables chalk based on the `colors` option', () => {
      reporter = new Reporter();
      expect(reporter.chalk.enabled).to.be.true;
      reporter = new Reporter({ colors: false });
      expect(reporter.chalk.enabled).to.be.false;
    });

    it('sets unknown options in the `options` property', () => {
      reporter = new Reporter({ foo: 'bar' });
      expect(reporter.options).to.have.property('foo', 'bar');
    });
  });

  describe('with colors enabled', () => {
    beforeEach(() => {
      reporter.colors = true;
    });

    it('writes red errors to stderr', () => {
      reporter.error('ERROR');
      expect(output.toString()).to.include(chalk.red('ERROR'));
    });

    it('writes gray error stacks to stderr', () => {
      let error = new Error();
      let { name, message } = error;

      // strip the first line and dedent the stack
      let stack = error.stack
        .replace(/^.*\n/, '')
        .replace(/^\s*/gm, '');

      // color the stack before indentating 2 spaces
      stack = chalk.gray(stack).replace(/^/gm, '  ');

      reporter.error(error);
      expect(output.toString()).to.equal(
        chalk`{red ${name}: ${message}}\n${stack}\n`
      );
    });
  });

  describe('processing state', () => {
    let chrome = { id: '01', browser: 'chrome' };
    let prev;

    beforeEach(() => {
      prev = create(State).connectBrowser(chrome);
    });

    it('calls `onStart` with tests when starting for the first time', () => {
      let next = prev.startTests(chrome, [{ name: 'test' }]);
      let started = false;

      reporter.onStart = tests => {
        expect(tests[0]).to.deep.include({ name: 'test' });
        started = true;
      };

      reporter.process(prev, next);
      expect(started).to.be.true;
    });

    it('calls `onUpdate` when updating a single test', () => {
      prev = prev.startTests(chrome, [{ name: 'single' }]);

      let next = prev.updateTests(chrome, [{ name: 'single', passing: true }]);
      let updated = false;

      reporter.onUpdate = test => {
        expect(test).to.deep.include({ name: 'single', passing: true });
        updated = true;
      };

      reporter.process(prev, next);
      expect(updated).to.be.true;
    });

    it('calls `onEnd` when browsers finish running tests', () => {
      prev = prev
        .startTests(chrome, [{ name: 'done' }])
        .updateTests(chrome, [{ name: 'done', failing: true }]);

      let next = prev.endTests(chrome);
      let ended = false;

      reporter.onEnd = tests => {
        expect(tests[0]).to.deep.include({ name: 'done', failing: true });
        ended = true;
      };

      reporter.process(prev, next);
      expect(ended).to.be.true;
    });
  });
});
