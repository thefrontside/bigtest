import { command, rmrf } from './helpers';
import { describe, it, beforeEach, afterEach, captureError } from '@effection/mocha';
import { daemon, Process, ProcessResult } from '@effection/process';
import { defaultTSConfig } from '@bigtest/project';

import expect from 'expect';
import process from 'process';
import { promises as fs } from 'fs';

const DRIVER = process.env.DRIVER || 'default';

describe('@bigtest/cli', function() {
  this.timeout(process.env.CI ? 120000 : 30000);

  describe('start', () => {
    describe('starting the server', () => {
      let child: Process;

      beforeEach(function*() {
        child = yield command('server');
      });

      it('outputs that the server was started successfully', function*() {
        yield child.stdout.lines().grep("[orchestrator] running!").expect();
      });
    });

    describe('starting the server without a command', () => {
      let child: Process;

      beforeEach(function*() {
        yield daemon('yarn test:app:start 36001');
        child = yield command('server', '--app.url', 'http://localhost:36001', '--app.command', '');
      });

      it('outputs that the server was started successfully', function*() {
        yield child.stdout.lines().grep("[orchestrator] running!").expect();
      });
    });

    describe('specifying the command via the cli', () => {
      let child: Process;

      beforeEach(function*() {
        child = yield command('server', '--app.url', 'http://localhost:36001', '--app.command', '"yarn test:app:start 36001"');
      });

      it('outputs that the server was started successfully', function*() {
        yield child.stdout.lines().grep("[orchestrator] running!").expect();
      });
    });
  });

  describe('test', () => {
    describe('running without server', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('test').join();
      });

      it("provides a nice error with advice to start `bigtest server`", function*() {
        expect(result.stderr).toContain('bigtest server');
      });
    });

    describe('running the suite successfully', () => {
      let startChild: Process;
      let result: ProcessResult;

      beforeEach(function*() {
        startChild = yield command('server', '--launch', DRIVER);
        yield startChild.stdout.lines().grep("[orchestrator] running!").expect();

        result = yield command('test', './test/fixtures/passing.test.ts').join();
      });

      it('exits successfully', function*() {
        expect(result.stdout).toContain("SUCCESS")
        expect(result.code).toEqual(0);
      });
    });

    describe('running the suite with failures', () => {
      let startChild: Process;
      let result: ProcessResult;

      beforeEach(function*() {
        startChild = yield command('server', '--launch', DRIVER);
        yield startChild.stdout.lines().grep("[orchestrator] running!").expect();

        result = yield command('test', './test/fixtures/failing.test.ts').join();
      });

      it('exits with error code', function*() {
        expect(result.stdout).toContain("FAILURE")
        expect(result.code).toEqual(1);
      });
    });

    describe('running the suite with build errors', () => {
      let startChild: Process;
      let result: ProcessResult;

      beforeEach(function*() {
        startChild = yield command('server', '--launch', DRIVER, '--test-files', './test/fixtures/syntax.broken.ts');

        yield startChild.stdout.lines().grep("[orchestrator] running!").expect();

        result = yield command('test').join();
      });


      it('exits with error code', function*() {
        expect(result.stdout).toContain('Cannot run tests due to build errors in the test suite')
        expect(result.stdout).toContain('test/fixtures/syntax.broken.ts')
        expect(result.stdout).toContain('⨯ FAILURE')
        expect(result.code).toEqual(1);
      });
    });
  });

  describe('ci', () => {
    describe('running the suite successfully', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', './test/fixtures/passing.test.ts', '--launch', DRIVER).join();
      });

      it('exits successfully', function*() {
        expect(result.stdout).toContain("✓ SUCCESS")
        expect(result.code).toEqual(0);
      });
    });

    describe('running the suite with failures', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', './test/fixtures/failing.test.ts', '--launch', DRIVER).join();
      });

      it('exits with error code', function*() {
        expect(result.stdout).toContain("test/fixtures/failing.test.ts:15")
        expect(result.stdout).toContain("⨯ FAILURE")
        expect(result.code).toEqual(1);
      });

      it('prints the error tree', function*() {
        expect(result.stdout).toContain('☲ Failing Test');
        expect(result.stdout).toContain('↪ first step');
        expect(result.stdout).toContain('↪ second step');
        expect(result.stdout).toContain('↪ third step');
        expect(result.stdout).toContain('✓ check the thing');
        expect(result.stdout).toContain('⨯ child second step');
      });
    });

    describe('running with an invalid bigtest.json file',  () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--config-file', './doesnotexist.json',  './test/fixtures').join();
      });

      it('exits with error code', function*() {
        expect(result.stderr).toContain('doesnotexist.json');
        expect(result.code).toEqual(1);
      });
    });

    describe('running with an invalid tsconfig.json file',  () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--tsconfig', './doesnotexist.json',  './test/fixtures').join();
      });

      it('exits with error code', function*() {
        expect(result.stderr).toContain('doesnotexist.json');
        expect(result.code).toEqual(1);
      });
    });

    describe('running the suite with build errors', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--test-files', './test/fixtures/syntax.broken.ts').join();
      });

      it('exits with error code', function*() {
        expect(result.stdout).toContain('Cannot run tests due to build errors in the test suite')
        expect(result.stdout).toContain('test/fixtures/syntax.broken.ts')
        expect(result.stdout).toContain('⨯ FAILURE')
        expect(result.code).toEqual(1);
      });
    });

    describe('running the suite with type errors', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--test-files', './test/fixtures/typescript.broken.ts').join();
      });

      it('exits with error code', function*() {
        expect(result.stdout).toContain('Cannot run tests due to build errors in the test suite')
        expect(result.stdout).toContain('test/fixtures/typescript.broken.ts')
        expect(result.stdout).toContain('Type \'string\' is not assignable to type \'number\'')
        expect(result.stdout).toContain('⨯ FAILURE')
        expect(result.code).toEqual(1);
      });
    });

    describe('running the suite with duplicate tests', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--test-files', './test/fixtures/duplicate.broken.ts').join();
      });

      it('exits with error code', function*() {
        expect(result.stdout).toContain('Cannot run tests due to build errors in the test suite')
        expect(result.stdout).toContain('Invalid Test: contains duplicate test: "duplicate child"')
        expect(result.stdout).toContain('test/fixtures/duplicate.broken.ts')
        expect(result.stdout).toContain('⨯ FAILURE')
        expect(result.code).toEqual(1);
      });
    });

    describe('running the suite with nesting depth exceeded', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--test-files', './test/fixtures/too-deep.broken.ts').join();
      });

      it('exits with error code', function*() {
        expect(result.stdout).toContain('Cannot run tests due to build errors in the test suite')
        expect(result.stdout).toContain('Invalid Test: is too deeply nested, maximum allowed depth of nesting is 10')
        expect(result.stdout).toContain('test/fixtures/too-deep.broken.ts')
        expect(result.stdout).toContain('⨯ FAILURE')
        expect(result.code).toEqual(1);
      });
    });

    describe('running the suite with app errors', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--app-command', 'yarn node doesnotexist.js').join();
      });
      it('exits with error code', function*() {
        expect(result.stdout).toContain('Application exited unexpectedly with exit code 1 with the following output:')
        expect(result.stdout).toContain('Cannot find module')
        expect(result.stdout).toContain('⨯ FAILURE')
        expect(result.code).toEqual(1);
      });
    });
  });

  describe('coverage', () => {
    beforeEach(function*() {
      yield rmrf('./tmp/coverage');
    });

    describe('when coverage output is requested', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--coverage', './test/fixtures/coverage.test.ts').join();
      });

      it('outputs the coverage reports', function*() {
        let access = yield fs.access('tmp/coverage/lcov/lcov.info');
        expect(access).toBeUndefined();
        expect(result.stdout).toContain('reported to -> ./tmp/coverage');
      });
    });

    describe('when requested, but there is no coverage data in the test run', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, '--coverage', './test/fixtures/passing.test.ts').join();
      });

      it('warns the user that there is no coverage data', function*() {
        expect(result.stderr).toContain('no coverage metrics were present');
      });
    });

    describe('when coverage data is present, but coverage output is not requested', () => {
      let result: ProcessResult;

      beforeEach(function*() {
        result = yield command('ci', '--launch', DRIVER, './test/fixtures/coverage.test.ts').join();
      });

      it('does nothing', function*() {
        expect(result.stdout).not.toContain('@bigtest/coverage');
        let error = yield captureError(fs.access('tmp/coverage/lcov/lcov.info'));

        expect(error).toHaveProperty('message', expect.stringContaining('no such file or directory'));
      });
    });
  });

  describe('init', () => {
    describe('running the init command', () => {
      let child: Process;
      let status: ProcessResult;

      beforeEach(function*() {
        child = yield command('init', '--config-file', './tmp/bigtest-config-test.json');

        yield child.stdout.lines().grep('Which port would you like to run BigTest on?').expect();
        child.stdin.send('not-a-port\n');

        yield child.stdout.lines().grep('Not a number!').expect();
        child.stdin.send('1234\n');

        yield child.stdout.lines().grep('Where are your test files located?').expect();
        child.stdin.send('test.ts\n');

        yield child.stdout.lines().grep('Do you want BigTest to start your application for you?').expect();
        child.stdin.send('\n');

        yield child.stdout.lines().grep('What command do you run to start your application?').expect();
        child.stdin.send('yarn run-my-app\n');

        yield child.stdout.lines().grep('Which port would you like to run your application on?').expect();
        child.stdin.send('9000\n');

        yield child.stdout.lines().grep('Which URL do you use to access your application?').expect();
        child.stdin.send('\n');

        yield child.stdout.lines().grep('Do you want to write your tests in TypeScript?').expect();
        child.stdin.send('yes\n');

        yield child.stdout.lines().grep('Do you want to set up a separate TypeScript `tsconfig` file for BigTest?').expect();
        child.stdin.send('yes\n');

        yield child.stdout.lines().grep('Where should the custom `tsconfig` be located?').expect();
        child.stdin.send('\n');

        status = yield child.join();
      });

      afterEach(function*() {
        yield fs.rename('./bigtest.tsconfig.json', './tmp/bigtest.tsconfig.json');
        yield rmrf('./tmp/');
      });

      it('exits successfully and writes a bigtest and typescript config files', function*() {
        expect(status.code).toEqual(0);
        let buffer = yield fs.readFile('./tmp/bigtest-config-test.json');
        let config = JSON.parse(buffer.toString());
        expect(config.port).toEqual(1234);
        expect(config.testFiles).toEqual(['test.ts']);
        expect(config.app.command).toEqual('yarn run-my-app');
        expect(config.app.env.PORT).toEqual(9000);
        expect(config.app.url).toEqual('http://localhost:9000');
        expect(config.tsconfig).toEqual('./bigtest.tsconfig.json');

        let generatedTSConfig = yield fs.readFile('./bigtest.tsconfig.json');
        expect(JSON.parse(generatedTSConfig.toString())).toEqual(defaultTSConfig());
      });
    });
  });
});
