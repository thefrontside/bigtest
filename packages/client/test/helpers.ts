import { Operation, resource, main } from 'effection';
import { Channel } from '@effection/channel';
import { subscribe } from '@effection/subscription';
import { express, Socket } from '@bigtest/effection-express';

import { beforeEach } from 'mocha';

import { Message, Response } from '../src';

interface World {
  halt(): void;
  spawn<T>(operation: Operation<T>): Promise<T>;
}
let currentWorld: World | null = null;

beforeEach(() => {
  currentWorld = main(undefined) as unknown as World;
});

afterEach(() => {
  assertWorldExists(currentWorld);
  currentWorld.halt();
});


export function run<T>(operation: Operation<T>): Promise<T> {
  assertWorldExists(currentWorld);
  return currentWorld.spawn(operation);
}

function assertWorldExists(world: World | null): asserts world is World {
  if (!world) {
    throw new Error(`what has become of the world?? it should exist at this point`);
  }
}


export class TestConnection {
  private incoming = new Channel<Message>();

  static *create(socket: Socket): Operation<TestConnection> {
    let connection = new TestConnection(socket);
    return yield resource(connection, function*() {
      yield subscribe(socket).forEach(function*(message) {
        connection.incoming.send(message);
      })
    });
  }

  constructor(private socket: Socket) {}

  receive(): Promise<Message | undefined> {
    return run(subscribe(this.incoming).first());
  }

  send(response: Response): Promise<void> {
    return run(this.socket.send(response));
  }

}

export class TestServer {
  connections = new Channel<TestConnection>();

  static async start(port: number): Promise<TestServer> {
    let app = express();
    let server = new TestServer();
    await run(app.ws('*', function*(socket: Socket) {
      let connection: TestConnection = yield TestConnection.create(socket);
      server.connections.send(connection);
      yield;
    }));
    await run(app.listen(port));
    return server;
  }

  async connection(): Promise<TestConnection> {
    let connection = await run(subscribe(this.connections).first());
    if (!connection) {
      throw new Error(`connection stream closed while still waiting`);
    } else {
      return connection;
    }
  }
}
