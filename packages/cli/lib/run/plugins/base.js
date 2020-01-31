import logger from '@util/logger';

const { assign } = Object;

/**
 * A plugin hooks into the coordinator and includes hooks used for
 * interacting with the different pieces that the coordinator is
 * responsible for.
 *
 * @param {Object} options - Plugin options
 */
export default class BasePlugin {
  /**
   * Key for options passed to a plugin from the plugin manager
   * @property {String}
   */
  static options = '';

  /**
   * @constructor
   */
  constructor(options = {}) {
    assign(this, {
      log: logger,
      options
    });
  }

  /**
   * The setup hook is invoked after the coordinator initializes all
   * of it's pieces. It is called with the client server, proxy
   * server, socket API server, and the state store instance.
   *
   * @param {ClientServer} client - Client server instance
   * @param {ProxyServer} proxy - Proxy server instance
   * @param {SocketServer} sockets - Socket API server instance
   * @param {Store} store - Coordinator state store
   */
  setup(client, proxy, sockets, store) {}

  /**
   * The start hook is invoked before the coordinator starts any other
   * pieces or launches browsers.
   *
   * @returns {Promise} should resolve after the plugin starts
   */
  async start() {}

  /**
   * The stop hook is invoked after the coordinator has closed
   * launched browsers and stopped all other pieces.
   *
   * @returns {Promise} should resolve after the plugin stops
   */
  async stop() {}
}
