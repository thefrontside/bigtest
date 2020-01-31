import url from 'url';
import EventEmitter from 'events';
import WebSocket from 'ws';
import { parseBrowserName } from '../util/browser';

function uid() {
  return (uid.uid = (uid.uid || 0) + 1).toString().padStart(3, '0');
}

/**
 * Wraps a websocket server to emit namespaced events sent from
 * websocket clients. Keeps track of connected websockets and
 * associated meta information. Events from websocket clients are
 * emitted with a meta object as the first argument, and any
 * additional data as the second argument.
 *
 * @param {NetServer} server - Server to attach to
 */
export default class SocketServer extends EventEmitter {
  constructor(server) {
    super();

    // initialize the websocket server
    let wss = new WebSocket.Server({ server });
    wss.on('connection', this.handleConnection.bind(this));

    Object.assign(this, {
      meta: new Map(),
      server: wss
    });
  }

  /**
   * Length of connected websockets
   */
  get length() {
    return this.meta.size;
  }

  /**
   * Retrieves the socket for the given id
   *
   * @param {String} id - meta id for a socket
   */
  socket(id) {
    for (let [socket, meta] of this.meta.entries()) {
      if (meta.id === id) {
        return socket;
      }
    }
  }

  /**
   * Sends an event with data to a connected websocket
   *
   * @param {WebSocket} socket - WebSocket client
   * @param {String} event - Event name
   * @param {Any} data - Event data
   */
  send(socket, event, data) {
    // socket meta id was given
    if (typeof socket === 'string') {
      socket = this.socket(socket);
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
    }
  }

  /**
   * Sends an event with data to all connected websockets within then
   * namespace they've connected on.
   *
   * @param {String} path - Namespace path
   * @param {String} event - Event name
   * @param {String} data - Event data
   */
  broadcast(path, event, data) {
    for (let [socket, meta] of this.meta.entries()) {
      if (meta.path === path) {
        this.send(socket, event, data);
      }
    }
  }

  /**
   * Generates and tracks meta for connecting websockets and attaches
   * relevant events. Emits a connect event on the namespaced path.
   *
   * @param {WebSocket} socket - The connecting WebSocket
   * @param {Request} request - WebSocket request object
   */
  handleConnection(socket, request) {
    let [path, id] = url.parse(request.url).pathname.substr(1).split('/');
    let browser = parseBrowserName(request.headers['user-agent']);
    let meta = { id: uid(), browser, path };

    socket.on('close', this.handleDisconnect.bind(this, socket));
    socket.on('message', this.handleMessage.bind(this, socket));

    this.meta.set(socket, meta);
    this.emit(`${path}/connect`, meta, id);
  }

  /**
   * Stops tracking meta for a websocket and emits a disconnect event
   * on the namespaced path.
   *
   * @param {WebSocket} socket - The disconnecting WebSocket
   */
  handleDisconnect(socket) {
    let meta = this.meta.get(socket);

    this.meta.delete(socket);
    this.emit(`${meta.path}/disconnect`, meta);
  }

  /**
   * Transforms raw message events from websockets into emitter events
   * that are dispatched with the namespaced path the websocket
   * connected to. Meta info and data parsed using `JSON.parse` is
   * passed along to the emitted event.
   *
   * @param {WebSocket} socket - The WebSocket sending the message event
   * @param {Buffer|String} raw - Raw message event data to be parsed
   */
  handleMessage(socket, raw) {
    let meta = this.meta.get(socket);
    let event, data;

    // if the raw message is unparsable, do nothing
    try { ({ event, data } = JSON.parse(raw)); } catch (e) {}

    if (event) {
      this.emit(`${meta.path}/${event}`, meta, data);
    }
  }
}
