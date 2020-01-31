import { describe, beforeEach, afterEach, it } from 'mocha';
import { when } from '@bigtest/convergence';
import WebSocket from 'ws';

import { expect } from '@tests/helpers';

import WebServer from '@run/servers/web';
import SocketServer from '@run/servers/sockets';

describe('Unit: SocketServer', () => {
  let test, server;
  let sockets = [];

  function connect(path = '') {
    let addr = server.url.replace('http', 'ws');
    return new Promise((resolve, reject) => {
      let ws = new WebSocket(`${addr}/${path}`)
        .once('open', () => resolve(ws))
        .once('error', reject);
      sockets.push(ws);
    });
  }

  function disconnect(ws) {
    return new Promise(resolve => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.once('close', resolve);
        ws.terminate();
      } else {
        resolve();
      }
    });
  }

  function get(index) {
    let entries = Array.from(test.meta.entries());
    let [socket, meta] = entries[index];
    return { socket, meta };
  }

  beforeEach(async () => {
    server = new WebServer();
    test = new SocketServer(server.server);
    await server.start();
  });

  afterEach(async () => {
    await Promise.all(sockets.map(disconnect));
    await server.stop();
    sockets = [];
  });

  it('tracks connected websockets', async () => {
    expect(test.length).to.equal(0);
    await connect('pathname');
    expect(test.length).to.equal(1);

    expect(get(0).meta).to.include({
      browser: 'Unknown',
      path: 'pathname'
    });
  });

  it('can retrieve a connected websocket by id', async () => {
    await connect('test');

    let { socket, meta } = get(0);
    expect(test.socket(meta.id)).to.equal(socket);
  });

  it('emits a namespaced connect event', async () => {
    let connected = false;

    test.on('test/connect', (meta, id) => {
      expect(meta).to.equal(get(0).meta);
      expect(id).to.be.undefined;
      connected = true;
    });

    await connect('test');
    expect(connected).to.be.true;
  });

  it('emits a namespaced connect event with an ID', async () => {
    let connected = false;

    test.on('test/connect', (meta, id) => {
      expect(meta).to.equal(get(0).meta);
      expect(id).to.equal('1234');
      connected = true;
    });

    await connect('test/1234');
    expect(connected).to.be.true;
  });

  it('emits a namespaced disconnect event', async () => {
    let ws = await connect('test');

    let disconnected = false;
    test.on('test/disconnect', () => disconnected = true);

    await disconnect(ws);
    // disconnected before the server emits the event
    await when(() => expect(disconnected).to.be.true);
  });

  it('emits namespaced events sent from connected sockets', async () => {
    let ws = await connect('test');

    let emitted = false;
    test.on('test/foo', (meta, data) => {
      expect(meta.path).to.equal('test');
      emitted = data;
    });

    // will be parsed by the server
    ws.send('{ "event": "foo", "data": "bar" }');
    await when(() => expect(emitted).to.equal('bar'));
  });

  it('can send events to a connected socket', async () => {
    let ws = await connect('test');

    let emitted = false;
    ws.on('message', raw => emitted = JSON.parse(raw));

    test.send(get(0).socket, 'foo', 'bar');

    await when(() => {
      expect(emitted).to.deep.equal({ event: 'foo', data: 'bar' });
    });
  });

  it('can send events to connected sockets within a namespace', async () => {
    let ws1 = await connect('test');
    let ws2 = await connect('test');
    let ws3 = await connect('other');

    let emitted = [];
    let handleMessage = raw => emitted.push(JSON.parse(raw));
    ws1.on('message', handleMessage);
    ws2.on('message', handleMessage);
    ws3.on('message', handleMessage);

    test.broadcast('test', 'foo', 'bar');

    await when(() => {
      expect(emitted).to.have.lengthOf(2);
      expect(emitted).to.deep.include({ event: 'foo', data: 'bar' });
    });

    test.broadcast('other', 'bar', 'baz');

    await when(() => {
      expect(emitted).to.have.lengthOf(3);
      expect(emitted).to.deep.include({ event: 'bar', data: 'baz' });
    });
  });
});
