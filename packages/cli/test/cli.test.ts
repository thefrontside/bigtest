import { describe, it, beforeEach } from 'mocha';
import { daemon, exec, ExitStatus } from '@effection/node';

import * as expect from 'expect';
import * as process from 'process';
import { promises as fs } from 'fs';

import { World } from './helpers/world';
import { Stream } from './helpers/stream';

export interface TestProcess {
  stdin: { write(data: string): void };
  stdout: Stream;
  stderr: Stream;
  join(): Promise<ExitStatus>;
  expect(): Promise<ExitStatus>;
}

async function run(...args: string[]): Promise<TestProcess> {
  let cli = await World.spawn(exec("yarn ts-node ./src/index.ts", {
    arguments: args
  }));

  let stdin = { write: (data: string) => cli.stdin.send(data) };
  let stdout = await World.spawn(Stream.of(cli.stdout, !!process.env['LOG_CLI']));
  let stderr = await World.spawn(Stream.of(cli.stderr, !!process.env['LOG_CLI']));
  let join = () => World.spawn(cli.join()) as unknown as Promise<ExitStatus>;
  let expect = () => World.spawn(cli.expect()) as unknown as Promise<ExitStatus>;

  return { stdin, stdout, stderr, join, expect };
}

describe('@bigtest/cli', function() {
  this.timeout(process.env.CI ? 120000 : 30000);

  describe('start', () => {
    describe('starting the server', () => {
      let child: { stdout: Stream; stderr: Stream };

      beforeEach(async () => {
        child = await run('server');
      });

      it('outputs that the server was started successfully', async () => {
        await child.stdout.detect("[orchestrator] running!");
      });
    });

    describe('starting the server without a command', () => {
      let child: TestProcess;

      beforeEach(async () => {
        await World.spawn(daemon('yarn bigtest-todomvc 36001'));
        child = await run('server', '--app.url', 'http://localhost:36001', '--no-app.command');
      });

      it('outputs that the server was started successfully', async () => {
        await child.stdout.detect("[orchestrator] running!");
      });
    });

    describe('specifying the command via the cli', () => {
      let child: TestProcess;

      beforeEach(async () => {
        child = await run('server', '--app.url', 'http://localhost:36001', '--app.command', '"yarn bigtest-todomvc 36001"');
      });

      it('outputs that the server was started successfully', async () => {
        await child.stdout.detect("[orchestrator] running!");
      });
    });
  });

  describe('test', () => {
    describe('running without server', () => {
      let runChild: TestProcess;

      beforeEach(async () => {
        runChild = await run('test');
        await runChild.join();
      });

      it("provides a nice error with advice to start `bigtest server`", () => {
        expect(runChild.stderr.output).toContain('bigtest server');
      });
    });

    describe('running the suite successfully', () => {
      let startChild: TestProcess;
      let runChild: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        startChild = await run('server');

        await startChild.stdout.detect("[orchestrator] running!");

        runChild = await run('test', './test/fixtures/passing.test.ts');

        status = await runChild.join();
      });

      it('exits successfully', async () => {
        expect(status.code).toEqual(0);
        expect(runChild.stdout.output).toContain("SUCCESS")
      });
    });

    describe('running the suite with failures', () => {
      let startChild: TestProcess;
      let runChild: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        startChild = await World.spawn(run('server'));

        await startChild.stdout.detect("[orchestrator] running!");

        runChild = await run('test', './test/fixtures/failing.test.ts');

        status = await runChild.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(runChild.stdout.output).toContain("FAILURE")
      });
    });

    describe('running the suite with build errors', () => {
      let startChild: TestProcess;
      let runChild: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        startChild = await run('server', '--test-files', './test/fixtures/syntax.broken.ts');

        await startChild.stdout.detect("[orchestrator] running!");

        runChild = await run('test');

        status = await runChild.join();
      });


      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(runChild.stdout.output).toContain('Cannot run tests due to build errors in the test suite')
        expect(runChild.stdout.output).toContain('test/fixtures/syntax.broken.ts')
        expect(runChild.stdout.output).toContain('⨯ FAILURE')
      });
    });
  });

  describe('ci', () => {
    describe('running the suite successfully', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', './test/fixtures/passing.test.ts');
        await child.stdout.detect("[orchestrator] running!");
        status = await child.join();
      });

      it('exits successfully', async () => {
        expect(status.code).toEqual(0);
        expect(child.stdout.output).toContain("✓ SUCCESS")
      });
    });

    describe('running the suite with failures', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', './test/fixtures/failing.test.ts');
        await child.stdout.detect("[orchestrator] running!");
        status = await child.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(child.stdout.output).toContain("test/fixtures/failing.test.ts:15")
        expect(child.stdout.output).toContain("⨯ FAILURE")
      });

      it('prints the error tree', async () => {
        expect(child.stdout.output).toContain('☲ Failing Test');
        expect(child.stdout.output).toContain('↪ first step');
        expect(child.stdout.output).toContain('↪ second step');
        expect(child.stdout.output).toContain('↪ third step');
        expect(child.stdout.output).toContain('✓ check the thing');
        expect(child.stdout.output).toContain('⨯ child second step');
      });
    });

    describe('running the suite with build errors', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', '--test-files', './test/fixtures/syntax.broken.ts');
        await child.stdout.detect("[orchestrator] running!");
        status = await child.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(child.stdout?.output).toContain('Cannot run tests due to build errors in the test suite')
        expect(child.stdout?.output).toContain('test/fixtures/syntax.broken.ts')
        expect(child.stdout?.output).toContain('⨯ FAILURE')
      });
    });

    describe('running the suite with type errors', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', '--test-files', './test/fixtures/typescript.broken.ts');
        await World.spawn(child.stdout?.waitFor('[orchestrator] running!'));
        status = await child.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(child.stdout?.output).toContain('Cannot run tests due to build errors in the test suite')
        expect(child.stdout?.output).toContain('test/fixtures/typescript.broken.ts')
        expect(child.stdout?.output).toContain('Type \'string\' is not assignable to type \'number\'')
        expect(child.stdout?.output).toContain('⨯ FAILURE')
      });
    });

    describe('running the suite with duplicate tests', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', '--test-files', './test/fixtures/duplicate.broken.ts');
        status = await child.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(child.stdout?.output).toContain('Cannot run tests due to build errors in the test suite')
        expect(child.stdout?.output).toContain('Invalid Test: contains duplicate test: "duplicate child"')
        expect(child.stdout?.output).toContain('test/fixtures/duplicate.broken.ts')
        expect(child.stdout?.output).toContain('⨯ FAILURE')
      });
    });

    describe('running the suite with nesting depth exceeded', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', '--test-files', './test/fixtures/too-deep.broken.ts');
        status = await child.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(child.stdout?.output).toContain('Cannot run tests due to build errors in the test suite')
        expect(child.stdout?.output).toContain('Invalid Test: is too deeply nested, maximum allowed depth of nesting is 10')
        expect(child.stdout?.output).toContain('test/fixtures/too-deep.broken.ts')
        expect(child.stdout?.output).toContain('⨯ FAILURE')
      });
    });

    describe('running the suite with app errors', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('ci', '--app-command', 'yarn node doesnotexist.js');
        status = await child.join();
      });

      it('exits with error code', async () => {
        expect(status.code).toEqual(1);
        expect(child.stdout?.output).toContain('Application exited unexpectedly with exit code 1 with the following output:')
        expect(child.stdout?.output).toContain('Cannot find module')
        expect(child.stdout?.output).toContain('⨯ FAILURE')
      });
    });
  });

  describe('coverage', () => {
    beforeEach( async() => {
      await fs.rmdir('./tmp/coverage', { recursive: true });
    });

    describe('when coverage output is requested', () => {
      let child: TestProcess;
      beforeEach(async () => {
        child = await run('ci', '--coverage', './test/fixtures/coverage.test.ts');
        await child.join();
      });

      it('outputs the coverage reports', async () => {
        await expect((fs.access('tmp/coverage/lcov/lcov.info'))).resolves.toBeUndefined();
        expect(child.stdout.output).toContain('reported to -> ./tmp/coverage');
      });
    });

    describe('when requested, but there is no coverage data in the test run', () => {
      let child: TestProcess;
      beforeEach(async () => {
        child = await run('ci', '--coverage', './test/fixtures/passing.test.ts');
        await child.join();
      });

      it('warns the user that there is no coverage data', async () => {
        expect(child.stderr.output).toContain('no coverage metrics were present');
      });
    });

    describe('when coverage data is present, but coverage output is not requested', () => {
      let child: TestProcess;
      beforeEach(async () => {
        child = await run('ci', './test/fixtures/coverage.test.ts');
        await child.join();
      });

      it('does nothing', async () => {
        expect(child.stdout?.output).not.toContain('@bigtest/coverage');
        await expect((fs.access('tmp/coverage/lcov/lcov.info'))).rejects.toMatchObject({
          message: expect.stringContaining('no such file or directory')
        });
      });
    });
  });

  describe('init', () => {
    describe('running the init command', () => {
      let child: TestProcess;
      let status: ExitStatus;

      beforeEach(async () => {
        child = await run('init', '--config-file', './tmp/bigtest-config-test.json');

        await child.stdout.detect('Which port would you like to run BigTest on?');
        child.stdin.write('not-a-port\n');
        await child.stdout.detect('Not a number!');
        child.stdin.write('1234\n');

        await child.stdout.detect('Where are your test files located?');
        child.stdin.write('test.ts\n');

        await child.stdout.detect('Do you want BigTest to start your application for you?');
        child.stdin.write('\n');

        await child.stdout.detect('What command do you run to start your application?');
        child.stdin.write('yarn run-my-app\n');

        await child.stdout.detect('Which port would you like to run your application on?');
        child.stdin.write('9000\n');

        await child.stdout.detect('Which URL do you use to access your application?');
        child.stdin.write('\n');

        await World.spawn(child.stdout?.waitFor('Do you want to write your tests in TypeScript?'));
        child.stdin?.write('no\n');

        status = await child.join();
      });

      it('exits successfully and writes a new config file', async () => {
        expect(status.code).toEqual(0);
        let buffer = await fs.readFile('./tmp/bigtest-config-test.json');
        let config = JSON.parse(buffer.toString());
        expect(config.port).toEqual(1234);
        expect(config.testFiles).toEqual(['test.ts']);
        expect(config.app.command).toEqual('yarn run-my-app');
        expect(config.app.env.PORT).toEqual(9000);
        expect(config.app.url).toEqual('http://localhost:9000');
      });
    });
  });
});
