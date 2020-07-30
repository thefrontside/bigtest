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
  });

  describe('test', () => {
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
        expect(child.stdout?.output).toContain("✓ [step:chrome.headless]");
        expect(child.stdout?.output).toContain("Passing Test -> first step");
        expect(child.stdout?.output).toContain("✓ [assertion:chrome.headless]");
        expect(child.stdout?.output).toContain("Passing Test -> check the thing");
        expect(child.stdout?.output).toContain("✓ SUCCESS");
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
        expect(child.stdout?.output).toContain("✓ [step:chrome.headless]");
        expect(child.stdout?.output).toContain("Failing Test -> first step");
        expect(child.stdout?.output).toContain("✓ [assertion:chrome.headless]");
        expect(child.stdout?.output).toContain("Failing Test -> check the thing");
        expect(child.stdout?.output).toContain("⨯ [step:chrome.headless]");
        expect(child.stdout?.output).toContain("Failing Test -> child -> child second step");
        expect(child.stdout?.output).toContain("⨯ FAILURE")
      });
    });
  });
});

interface AgentQueryResult {
  agents: Array<{
    agentId: string;
  }>;
}
