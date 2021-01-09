import { describe, beforeEach, it } from 'mocha';
import expect from 'expect';

import { timeout } from 'effection';
import { Channel } from '@effection/channel';
import { subscribe, ChainableSubscription } from '@effection/subscription';
import WebSocket from 'ws';

import { run } from './helpers';
import { Socket, express, CloseEvent } from '../src';

describe('websocket server', () => {
  let client: WebSocket;
  let connection: Socket;

  beforeEach(async () => {
    let incoming = new Channel<Socket>();
    let sockets = await run(subscribe(incoming));

    let app = express();
    await run(app.ws('*', function*(socket) {
      incoming.send(socket);
      yield;
    }));
    await run(app.listen(3400));


    client = new WebSocket('http://127.0.0.1:3400');

    connection = await run(sockets.expect());
  });

  it('accepts connections', () => {
    expect(connection).toBeDefined();
  });

  describe('when receiving messages via subscription', () => {
    let messages: ChainableSubscription<unknown, CloseEvent>;

    beforeEach(async () => {
      messages = await run(subscribe(connection));

      // we can't send messages until the client is connected
      await run(function*() {
        while (client.readyState !== client.OPEN) {
          expect(client.readyState).toEqual(client.CONNECTING);
          yield timeout(10);
        }
      })

      client.send(JSON.stringify({ message: "Hello World!" }));
      client.send(JSON.stringify({ message: "Goodbye World!" }));
    });

    it('publishes them on the server', async () => {
      expect(await run(messages.expect())).toEqual({ message: "Hello World!" });
      expect(await run(messages.expect())).toEqual({ message: "Goodbye World!" });
    });

    describe('when the client closes', () => {
      let close: CloseEvent;
      beforeEach(async () => {
        client.close(4000, 'an application defined status code');
        close = await run(messages.forEach(function*() { return; }));
      });

      it('finishes the subscription with the close event', async () => {
        expect(close.code).toEqual(4000);
        expect(close.reason).toEqual('an application defined status code')
      });
    });
  });


})
