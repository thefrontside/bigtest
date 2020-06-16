import { Operation, resource, contextOf, Context } from 'effection';
import { DriverSpec, Driver } from '@bigtest/driver';
import { Agent, Socket } from '@bigtest/agent';

import * as WebSocket from 'ws';
import * as os from 'os';

import { run } from './run';

export function *create(spec: DriverSpec<NodeOptions>): Operation<Driver> {
  return yield resource(new NodeDriver(spec.options), undefined);
}

export interface NodeOptions {}

class NodeDriver {
  constructor(public options: NodeOptions) {}

  get context(): SpawnPoint {
    return contextOf(this) as unknown as SpawnPoint;
  }

  *connect(agentURL: string) {
    let url = new URL(agentURL);
    let connectTo: string = url.searchParams.get('connectTo') || '';
    let agentId = url.searchParams.get('agentId') || undefined;

    if (connectTo === '') {
      throw new Error(`unable to extract connectTo url from ${url}`);
    }

    let agent: Agent = yield Agent.start({
      createSocket: () => new WebSocket(connectTo) as Socket,
      agentId,
      data: {
        os: {
          name: os.type(),
          version: os.release(),
          versionName: os.platform()
        },
        platform: {
          type: os.arch(),
          vendor: os.cpus()[0].model
        }
      }
    });


    this.context.spawn(function*() {
      console.log('[node agent] waiting for commands');
      yield agent.commands.forEach(function*(command) {
        let { testRunId } = command;
        agent.send({ type: 'run:begin', testRunId });
        try {
          yield run(agent, command);
        } finally {
          agent.send({ type: 'run:end', testRunId });
        }
      });
    });

    return agent;
  }
}

interface SpawnPoint {
  spawn<T>(operation: Operation<T>): Context<T>;
}
