import path from 'path';
import WebServer from './web';

/**
 * Client UI server that simply serves the client directory and any
 * other files provided to the `serve` method.
 *
 * @param {Object} [options] - WebServer options
 */
export default class ClientServer extends WebServer {
  constructor(options) {
    super(options);

    this.serve('/', require('express').static(
      path.join(__dirname, '../client')
    ));
  }
}
