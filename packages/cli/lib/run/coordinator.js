import { when } from '@bigtest/convergence';

import logger from '@util/logger';
import ClientServer from './servers/client';
import SocketServer from './servers/sockets';
import ProxyServer from './servers/proxy';

import ReporterManager from './reporters';
import BrowserManager from './browsers';
import PluginManager from './plugins';

import State, { Store, create } from './state';

const { assign } = Object;

/**
 * The coordinator class coordinates the different pieces involved
 * when launching browsers and running & reporting tests.
 *
 * @param {String} [options.logLevel="info"] - Log level
 * @param {String|Object|String[]|Object[]} [options.reporter="dot"] -
 * Reporter name(s) and/or reporter options
 * @param {String[]} [options.plugins=[]] - Plugins to use
 * @param {String[]} [options.browsers=[]] - Browsers to launch
 * @param {Object} [options.client={}] - Client server options
 * @param {Object} [options.proxy={}] - Proxy server options
 * @param {Function} [options.exit=noop] - Called when stopped
 * @param {Boolean} [options.once=false] - Exit after finishing
 * @param {Object} [...options] - Remaining options used for plugins
 */
export default class Coordinator {
  constructor({
    browsers: browsersList = [],
    reporters: reportersList = ['dot'],
    plugins: pluginsList = [],
    client: clientOptions = {},
    proxy: proxyOptions = {},
    verbose = false,
    once = false,
    exit = () => {},
    ...options
  } = {}) {
    logger.level = verbose ? 'debug' : 'info';

    // initialize variable pieces
    let browsers = new BrowserManager(browsersList, options);
    let reporter = new ReporterManager(reportersList, options);
    let plugins = new PluginManager(pluginsList, options);

    // initialize pluggable pieces
    let client = new ClientServer(clientOptions);
    let proxy = new ProxyServer(proxyOptions);
    let sockets = new SocketServer(client.server);

    // initialize state
    let store = Store(create(State), (next, state, args) => {
      let results = next(state, args);
      reporter.process(state, results);
      this.handleUpdate(state, results);
      return results;
    });

    // call plugin setup hooks
    plugins.setup(client, proxy, sockets, store);

    // client API (TODO: move?)
    sockets.on('client/connect', (meta, id) => {
      if (id) store.updateLaunched(meta, id);
      sockets.send(meta.id, 'proxy:connected', proxy.url);
    });

    // assign everything
    assign(this, {
      log: logger,
      exit,
      once,
      reporter,
      plugins,
      browsers,
      client,
      proxy,
      sockets,
      store
    });
  }

  /**
   * When the state is updated, this method recieves the previous and
   * next state instance. The coordinator then triggers actions in
   * response to the differences in state.
   *
   * @param {State} prev - The previous state instance
   * @param {State} next - The next state instance
   */
  handleUpdate(prev, next) {
    // once finished, maybe stop
    if (next.finished && this.once) {
      this.stop(next.status);

    // servers running & browsers connected
    } else if (next.ready) {
      // browsers ready, broadcast run to all connected adapters
      if (!prev.ready) {
        this.sockets.broadcast('adapter', 'run');
      // signal any newly waiting browsers to run
      } else if (prev.browsers !== next.browsers) {
        next.browsers.forEach((browser, b) => {
          let prevb = prev.browsers[b];

          if (!(prevb && prevb.waiting) && browser.waiting) {
            browser.sockets.forEach((socket, s) => {
              if (!(prevb && prevb.sockets[s])) {
                this.sockets.send(socket.id, 'run');
              }
            });
          };
        });
      }
    }
  }

  /**
   * Starts any plugins, the client and proxy servers, and launches
   * browsers. If the browsers do not connect within 10 seconds, an
   * error is thrown. However all errors are captured here and trigger
   * the coordinator to immediately stop.
   */
  async start() {
    try {
      // start plugins
      this.log.debug(`Starting plugins...`);
      await this.plugins.start();

      // start proxy
      this.log.debug('Starting proxy server...');
      await this.proxy.start();

      // start client
      this.log.debug('Starting client server...');
      await this.client.start();

      // launch browsers
      await this.browsers.launch(this.client.url, browser => {
        this.log.info(`Launching ${browser.name}...`);
        this.store.launchBrowser(browser.id);
      });

      // give browsers 10 seconds to connect
      await when(() => this.store.ready || (
        throw new Error('Launched browsers did not connect')
      ), 10000);

      // when ready, tests will start running
      this.log.debug('Starting tests...');

      // catch errors and cleanup
    } catch (err) {
      this.log.error(err.message);
      await this.stop(1);
    }
  }

  /**
   * Kills launched browsers, stops the client and proxy servers, and
   * stops any running plugins before exiting with the provided status
   * code (defaults to `0`).
   *
   * @param {Number} [status=0] - the status code passed to `exit`
   */
  async stop(status = 0) {
    this.log.debug('Shutting down...');

    // kill all browsers
    this.log.debug('Closing browsers...');
    await this.browsers.kill();

    // stop client and proxy servers
    this.log.debug('Stopping client server...');
    await this.client.stop();

    this.log.debug('Stopping proxy server...');
    await this.proxy.stop();

    // stop plugins
    this.log.debug('Stopping plugins...');
    await this.plugins.stop();

    // exit
    this.exit(status);
  }
}
