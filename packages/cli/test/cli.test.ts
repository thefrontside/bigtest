import { describe, it, beforeEach, afterEach } from 'mocha';
import * as expect from 'expect';
import * as process from 'process';

import { Process } from './helpers/process';
import { World } from './helpers/world';

import { Local, WebDriver } from '@bigtest/webdriver';
import { Client } from '@bigtest/server';

function run(...args: string[]) {
  return Process.spawn("yarn ts-node ./src/index.ts", args, {
    verbose: !!process.env["LOG_CLI"]
  });
}

describe('@bigtest/cli', function() {
  this.timeout(20000);

  describe('starting the server', () => {
    let child: Process;

    beforeEach(async () => {
      child = await World.spawn(run('server'));
    });

    afterEach(async () => {
      await World.spawn(child.close());
    });

    it('outputs that the server was started successfully', async () => {
      await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
    });

    describe('running the suite', () => {
      let runChild: Process;
      let browser: WebDriver;
      let client: Client;

      beforeEach(async () => {
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));

        let connectionUrl = "ws://localhost:24003";
        let agentUrl = `http://localhost:24004?connectTo=${encodeURIComponent(connectionUrl)}`;

        browser = await World.spawn(Local('chromedriver', { headless: true }));
        await World.spawn(browser.navigateTo(agentUrl));

        client = await World.spawn(Client.create(`http://localhost:24002`));

        let agentsSubscription = await World.spawn(client.subscribe(`{ agents { agentId } }`));
        await World.spawn(agentsSubscription.receive(({ agents }: AgentQueryResult) => agents && agents.length === 1));

        runChild = await World.spawn(run('test'));
        await World.spawn(runChild.join());
      });

      it('exits successfully', async () => {
        expect(runChild.code).toEqual(0);
        expect(runChild.stdout?.output).toContain("SUCCESS")
      });
    });
  });
});

interface AgentQueryResult {
  agents: Array<{
    agentId: string;
  }>;
}
