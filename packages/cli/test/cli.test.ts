import { describe, it, beforeEach, afterEach } from 'mocha';
import * as expect from 'expect';
import * as process from 'process';

import { Process } from './helpers/process';
import { World } from './helpers/world';

function run(...args: string[]) {
  return Process.spawn("yarn ts-node ./src/index.ts", args, {
    verbose: !!process.env["LOG_CLI"]
  });
}

describe('@bigtest/cli', function() {
  this.timeout(process.env.CI ? 120000 : 30000);

  describe('start', () => {
    describe('starting the server', () => {
      let child: Process;

      beforeEach(async () => {
        child = await World.spawn(run('server', '--launch', 'chrome.headless'));
      });

      afterEach(async () => {
        await World.spawn(child.close());
      });

      it('outputs that the server was started successfully', async () => {
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
      });
    });

    describe('starting the server without a command', () => {
      let child: Process;
      let childApp: Process;

      beforeEach(async () => {
        childApp = await World.spawn(Process.spawn('yarn bigtest-todomvc 36001', [], {}));
        child = await World.spawn(run('server', '--launch', 'chrome.headless', '--app.url', 'http://localhost:36001', '--no-app.command', '--test-files', './test/fixtures/passing.test.ts'));
      });

      afterEach(async () => {
        await World.spawn(child.close());
        await World.spawn(childApp.close());
      });

      it('outputs that the server was started successfully', async () => {
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
      });
    });

    describe('specifying the command via the cli', () => {
      let child: Process;

      beforeEach(async () => {
        child = await World.spawn(run('server', '--launch', 'chrome.headless', '--app.url', 'http://localhost:36001', '--app.command', '"yarn bigtest-todomvc 36001"', '--test-files', './test/fixtures/passing.test.ts'));
      });

      afterEach(async () => {
        await World.spawn(child.close());
      });

      it('outputs that the server was started successfully', async () => {
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
      });
    });
  });

  describe('test', () => {

    describe('running without server', () => {
      let runChild: Process;

      beforeEach(async () => {
        runChild = await World.spawn(run('test'));
        await World.spawn(runChild.join());
      });

      afterEach(async () => {
        await World.spawn(runChild.close());
      });

      it("provides a nice error with advice to start `bigtest server`", () => {
        expect(runChild.stderr?.output).toContain('bigtest server');
      });
    });

    describe('running the suite successfully', () => {
      let startChild: Process;
      let runChild: Process;

      beforeEach(async () => {
        startChild = await World.spawn(run('server', '--launch', 'chrome.headless', '--test-files', './test/fixtures/passing.test.ts'));

        await World.spawn(startChild.stdout?.waitFor("[orchestrator] running!"));

        runChild = await World.spawn(run('test'));

        await World.spawn(runChild.join());
      });

      afterEach(async () => {
        await World.spawn(startChild.close());
      });

      it('exits successfully', async () => {
        expect(runChild.code).toEqual(0);
        expect(runChild.stdout?.output).toContain("SUCCESS")
      });
    });

    describe('running the suite with failures', () => {
      let startChild: Process;
      let runChild: Process;

      beforeEach(async () => {
        startChild = await World.spawn(run('server', '--launch', 'chrome.headless', '--test-files', './test/fixtures/failing.test.ts'));

        await World.spawn(startChild.stdout?.waitFor("[orchestrator] running!"));

        runChild = await World.spawn(run('test'));

        await World.spawn(runChild.join());
      });

      afterEach(async () => {
        await World.spawn(startChild.close());
      });

      it('exits with error code', async () => {
        expect(runChild.code).toEqual(1);
        expect(runChild.stdout?.output).toContain("FAILURE")
      });
    });
  });

  describe('ci', () => {
    describe('running the suite successfully', () => {
      let child: Process;

      beforeEach(async () => {
        child = await World.spawn(run('ci', '--launch', 'chrome.headless', '--test-files', './test/fixtures/passing.test.ts'));
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
        await World.spawn(child.join());
      });

      afterEach(async () => {
        await World.spawn(child.close());
      });

      it('exits successfully', async () => {
        expect(child.code).toEqual(0);
        expect(child.stdout?.output).toContain("✓ [step]       Passing Test -> first step")
        expect(child.stdout?.output).toContain("✓ [assertion]  Passing Test -> check the thing")
        expect(child.stdout?.output).toContain("✓ SUCCESS")
      });
    });

    describe('running the suite with failures', () => {
      let child: Process;

      beforeEach(async () => {
        child = await World.spawn(run('ci', '--launch', 'chrome.headless', '--test-files', './test/fixtures/failing.test.ts'));
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
        await World.spawn(child.join());
      });

      afterEach(async () => {
        await World.spawn(child.close());
      });

      it('exits with error code', async () => {
        expect(child.code).toEqual(1);
        expect(child.stdout?.output).toContain("✓ [step]       Failing Test -> first step")
        expect(child.stdout?.output).toContain("✓ [assertion]  Failing Test -> check the thing")
        expect(child.stdout?.output).toContain("⨯ [step]       Failing Test -> child -> child second step")
        expect(child.stdout?.output).toContain("test/fixtures/failing.test.ts:14")
        expect(child.stdout?.output).toContain("⨯ FAILURE")
      });
    });
  });
});
