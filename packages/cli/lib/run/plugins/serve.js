import BasePlugin from './base';
import ChildProcess from '../process';
import splitStringArgs from '../util/split-string-args';
import request from '../util/request';

const { assign } = Object;

/**
 * The serve plugin starts a server child process and sets the proxy
 * target to the served URL. The process is considered started when
 * the URL responds to requests successfully.
 *
 * @param {String} options.command - The command used to start serving
 * @param {String} [options.url="localhost:3000"] - Server URL
 * @param {Object} [options.env={}] - Environment vars for the command
 * @param {Number} [options.timeout=10000] - Request timeout
 * @param {Boolean} [options.silent=false] - Silence serve output
 */
export default class ServePlugin extends BasePlugin {
  static options = 'serve';

  /**
   * Sets the proxy target and initializes the child process class
   *
   * @param {ClientServer} client - Client server instance
   * @param {ProxyServer} proxy - Proxy server instance
   */
  setup(client, proxy) {
    let { exec, env, url } = this.options;
    let [ cmd, ...args ] = splitStringArgs(exec);

    // set the proxy target
    proxy.set(url);

    // initialize the child process
    this.serve = new ChildProcess({
      name: 'Serve',
      env: assign({
        FORCE_COLOR: true,
        NODE_ENV: 'test'
      }, env),
      cmd,
      args
    });
  }

  /**
   * Starts the serve child process and resolves once requests at the
   * URL are successful.
   *
   * @returns {Promise} resolves when target requests are successful,
   * rejects after the timeout, or when the plugin is stopped while
   * checking for a response.
   */
  async start() {
    let {
      url,
      exec,
      silent = false,
      timeout = 10000
    } = this.options;
    let error;

    this.log.info(`Running \`${exec}\`...`);

    // resolves when done running
    this.serve.run()
      .catch(err => { error = err; });

    // forward output
    if (!silent) {
      this.serve.pipe(process);
    }

    // start checking for a response
    try {
      this.check = true;

      let self = this;
      let time = Date.now();

      // continuously requests a response status until surpassing a
      // timeout or encountering an interruption
      await (async function check() {
        let res = await request(url).catch(() => false);
        let isOK = res && res.statusCode >= 200 && res.statusCode < 400;

        if (error) {
          throw error;
        } else if (!self.check) {
          throw new Error('Aborted');
        } else if (!isOK) {
          if ((Date.now() - time) > timeout) {
            throw new Error(`Unable to serve "${url}"`);
          } else {
            return check();
          }
        }
      })();

    // catch errors so we can clean up
    } catch (err) {
      error = err;
      throw error;

    // always clean up
    } finally {
      this.check = false;
      this.serve.unpipe(process);

      // no error, log
      if (!error) {
        this.log.info(`Serving "${url}"`);
      }
    }
  }

  /**
   * Stops the child serve process and aborts any ongoing checks
   */
  async stop() {
    let { exec } = this.options;

    if (this.serve.running) {
      this.log.debug(`Stopping \`${exec}\`...`);
      await this.serve.kill();
    }

    this.check = false;
  }
}
