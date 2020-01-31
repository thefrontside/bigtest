import http from 'http';
import { when } from '@bigtest/convergence';

const { assign, entries } = Object;

/**
 * Generic web server class that adds async start and stop methods and
 * initializes an empty express app.
 *
 * @param {String} [options.hostname=localhost] - Server host name
 * @param {NUmber} [options.port=3000] - Server port number
 */
export default class WebServer {
  constructor({
    hostname = 'localhost',
    port = 3000
  } = {}) {
    let express = require('express');

    let router = express.Router();
    let app = express().use(router);
    let server = http.createServer(app);

    assign(this, {
      connections: new Set(),
      running: false,
      hostname,
      port,
      server,
      router,
      app
    });
  }

  /**
   * The root URL for this server instance
   */
  get url() {
    return `http://${this.hostname}:${this.port}`;
  }

  /**
   * Asynchronously starts this server instance
   *
   * @returns {Promise} resolves once the server is listening
   * @throws {Error} when the server errors while starting
   */
  async start() {
    let error = null;

    let errHandler = err => {
      this.server.close();
      error = err;
    };

    let listenHandler = () => {
      this.server.removeListener('error', errHandler);
      this.running = true;
    };

    this.server.once('error', errHandler);
    this.server.once('listening', listenHandler);
    this.server.on('connection', this.handleConnection.bind(this));
    this.server.listen(this.port, this.hostname);

    await when(() => this.running || !!error);
    if (error) throw error;
  }

  /**
   * Asynchronously stops this server instance
   *
   * @returns {Promise} resolves once the server has closed
   */
  async stop() {
    // when not open, callback is immediately invoked
    this.server.close(() => {
      this.running = false;
    });

    for (let socket of this.connections) {
      socket.destroy();
    }

    // resolve when the server is no longer running
    await when(() => !this.running);
  }

  /**
   * Tracks incoming connections so that they can be safely destroyed
   * if the server is closed.
   *
   * @private
   * @param {Socket} socket - Incoming connection
   */
  handleConnection(socket) {
    this.connections.add(socket);

    socket.once('close', () => {
      this.connections.delete(socket);
    });
  }

  /**
   * Serves a given file at the provided path on this server
   *
   * @param {String} path - URL path to serve the file at
   * @param {String|Object|Function} what - Path to file to serve
   */
  serve(path, what) {
    // a hash of file paths were given to serve
    if (path instanceof Object) {
      return entries(path).reduce((self, args) => {
        return self.serve(...args);
      }, this);
    }

    // normalize path
    path = path[0] === '/' ? path : `/${path}`;

    if (typeof what === 'function') {
      this.router.use(path, what);
    } else if (typeof what === 'string') {
      let file = require.resolve(what);
      this.router.get(path, (req, res) => res.sendFile(file));
    } else if (typeof what === 'object') {
      this.router.get(path, (req, res) => res.json(what));
    }

    // return this instance for chaining
    return this;
  }
}
