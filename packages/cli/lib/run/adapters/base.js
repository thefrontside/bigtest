const { WebSocket } = window;

export default class BaseAdapter {
  static init(options) {
    let instance = new this();

    instance.init(options);

    window.addEventListener('load', () => {
      instance.connect(options.client);
    });
  }

  constructor() {
    // adapters are singletons
    if (this.constructor.instance) {
      return this.constructor.instance;
    } else {
      this.constructor.instance = this;
    }

    // attach the run listener
    this.on('run', this.run.bind(this));
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      let { hostname, port } = new URL(url);

      // connect socket
      this.socket = new WebSocket(`ws://${hostname}:${port}/adapter`);

      // promise listeners
      this.socket.addEventListener('open', () => resolve());
      this.socket.addEventListener('error', e => reject(e));

      // socket messages trigger adapter events
      this.socket.addEventListener('message', e => {
        try {
          let { event, data } = JSON.parse(e.data);
          if (event) this.emit(event, data);
        } catch (err) {}
      });
    });
  }

  send(event, data) {
    this.socket.send(JSON.stringify({ event, data }));
  }

  on(event, callback) {
    this.listeners = this.listeners || {};
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    this.listeners = this.listeners || {};

    for (let callback of this.listeners[event]) {
      callback.call(this, data);
    }
  }

  init() {}
  run() {}
}
