import create, { update } from './create';

/**
 * Represents a connected websocket from a browser
 */
export class BrowserSocket {
  /**
   * The ID of the connected websocket
   * @property {String}
   */
  id = '';

  /**
   * True when the socket is not running or finished
   * @property {Boolean}
   */
  get waiting() {
    return !(this.running || this.finished);
  }

  /**
   * Maybe transitions into a RunningBrowserSocket subclass instance
   *
   * @returns {BrowserSocket}
   */
  run() {
    if (!this.running) {
      return create(RunningBrowserSocket, this);
    } else {
      return this;
    }
  }
}

export class RunningBrowserSocket extends BrowserSocket {
  /**
   * @constant {Boolean}
   * @default
   */
  running = true;

  /**
   * Maybe transitions into a RunningBrowserSocket subclass instance
   *
   * @returns {BrowserSocket}
   */
  done() {
    return create(FinishedBrowserSocket, this);
  }
}

export class FinishedBrowserSocket extends BrowserSocket {
  /**
   * @constant {Boolean}
   * @default
   */
  finished = true;
}

export default class Browser {
  /**
   * ID of a launched browser
   * @property {String}
   */
  id = '';

  /**
   * The name of this browser
   * @property {String}
   */
  name = 'Unknown';

  /**
   * Whether the browser was launched
   * @property {Boolean}
   */
  launched = false;

  /**
   * Connected websocket states
   * @property {BrowserSocket[]}
   */
  sockets = [];

  /**
   * True when there are connected websockets
   * @property {Boolean}
   */
  get connected() {
    return this.sockets.length > 0;
  }

  /**
   * True when some connected websockets are waiting
   * @property {Boolean}
   */
  get waiting() {
    return this.connected &&
      this.sockets.some(socket => socket.waiting);
  }

  /**
   * True when some connected websockets are running
   * @property {Boolean}
   */
  get running() {
    return this.connected &&
      this.sockets.some(socket => socket.running);
  }

  /**
   * True when all connected websockets are finished
   * @property {Boolean}
   */
  get finished() {
    return this.connected &&
      this.sockets.every(socket => socket.finished);
  }

  /**
   * Adds a BrowserSocket instance when a new websocket connects
   *
   * @param {String} sid - Socket ID
   * @returns {Browser}
   */
  connect(sid) {
    let index = this.sockets.findIndex(socket => {
      return socket.id === sid;
    });

    if (index === -1) {
      return this.set({
        sockets: this.sockets.concat(
          create(BrowserSocket, { id: sid })
        )
      });
    } else {
      return this;
    }
  }

  /**
   * Removes a BrowserSocket instance when a websocket disconnects
   *
   * @param {String} sid - Socket ID
   * @returns {Browser}
   */
  disconnect(sid) {
    let index = this.sockets.findIndex(socket => {
      return socket.id === sid;
    });

    if (index > -1) {
      return this.set({
        sockets: update(this.sockets, index, null)
      });
    } else {
      return this;
    }
  }

  /**
   * Transitions a connected BrowserSocket instance into a
   * RunningBrowserSocket instance.
   *
   * @param {String} sid - Socket ID
   * @returns {Browser}
   */
  run(sid) {
    let index = this.sockets.findIndex(socket => {
      return socket.id === sid;
    });

    if (index > -1) {
      return this.set({
        sockets: update(this.sockets, index, socket => {
          return socket.run();
        })
      });
    } else {
      return this;
    }
  }

  /**
   * Transitions a connected RunningBrowserSocket instance into a
   * FinishedBrowserSocket instance.
   *
   * @param {String} sid - Socket ID
   * @returns {Browser}
   */
  done(sid) {
    let index = this.sockets.findIndex(socket => {
      return socket.id === sid;
    });

    if (index > -1) {
      return this.set({
        sockets: update(this.sockets, index, socket => {
          return socket.done();
        })
      });
    } else {
      return this;
    }
  }
}
