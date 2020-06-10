import { Operation, resource, spawn, contextOf, Context } from 'effection';
import { throwOnErrorEvent, once } from '@effection/events';
import { Subscribable, SymbolSubscribable, createSubscription, forEach } from '@effection/subscription';
import { DriverSpec, Driver } from '@bigtest/driver';
import { Command, AgentEvent } from '@bigtest/agent';

import * as WebSocket from 'ws';

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
    let agentId: string = url.searchParams.get('agentId') || '';

    if (connectTo === '') {
      throw new Error(`unable to extract connectTo url from ${url}`);
    }

    if (agentId === '') {
      throw new Error(`unable to extract agentId url from ${url}`);
    }

    this.context.spawn(function*() {
      let websocket = new WebSocket(connectTo);
      yield throwOnErrorEvent(websocket);

      yield once(websocket, "open");

      try {
        let connection = createConnection(websocket, agentId);

        yield forEach(connection, function*(command) {
          console.log('command =', command);
        });
      } finally {
        websocket.close();
      }
    })
  }
}

class Connection implements Subscribable<Command, void> {
  constructor(private socket: WebSocket) {}

  send(event: AgentEvent) {
    this.socket.send(JSON.stringify(event));
  }

  [SymbolSubscribable]() {
    let { socket } = this;
    return createSubscription<Command, void>(function*(publish) {
      spawn(function*() {
        try {
          socket.on('message', publish)
          yield;
        } finally {
          socket.off('message', publish);
        }
      });

      yield once(socket, 'close');
    });
  }
}

function createConnection(socket: WebSocket, agentId: string) {
  let connection = new Connection(socket);
  let os = require('os');
  connection.send({
    type: "connected",
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
  return connection;
}

interface SpawnPoint {
  spawn<T>(operation: Operation<T>): Context<T>;
}
