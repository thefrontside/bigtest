import { describe, it, beforeEach, afterEach } from 'mocha';
import * as expect from 'expect';
import * as process from 'process';

import { Process } from './helpers/process';
import { World } from './helpers/world';

import { Client } from '@bigtest/server';

function run(...args: string[]) {
  return Process.spawn("yarn ts-node ./src/index.ts", args, {
    verbose: !!process.env["LOG_CLI"]
  });
}

describe('@bigtest/cli', function() {
  this.timeout(60000);

  describe('starting the server', () => {
    let child: Process;

    beforeEach(async () => {
      child = await World.spawn(run('server', '--launch', 'chrome@headless:true'));
    });

    afterEach(async () => {
      await World.spawn(child.close());
    });

    it('outputs that the server was started successfully', async () => {
      await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));
    });

    describe('running the suite', () => {
      let runChild: Process;
      let client: Client;

      beforeEach(async () => {
        await World.spawn(child.stdout?.waitFor("[orchestrator] running!"));

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
