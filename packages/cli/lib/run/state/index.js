import create, { update } from './create';
import Browser from './browser';
import Test from './test';

export { default as Store } from './store';
export { create };

/**
 * Represents the state of the entire run process
 */
export default class State {
  /**
   * All tests being run
   * @property {Test[]}
   */
  tests = [];

  /**
   * All browsers being run
   * @property {Browser[]}
   */
  browsers = [];

  /**
   * True when launched browsers have connected
   * @property {Boolean}
   */
  ready = false;

  /**
   * True when there are tests present
   * @property {Boolean}
   */
  get started() {
    return !!this.tests.length;
  }

  /**
   * True when all browsers are in a finished state
   * @property {Boolean}
   */
  get finished() {
    return this.browsers.every(browser => browser.finished);
  }

  /**
   * When there are failing tests, status is `1`, otherwise it is `0`
   * @property {Number}
   */
  get status() {
    return this.tests.some(test => test.failing) ? 1 : 0;
  }

  /**
   * Adds a launched browser state with an ID
   *
   * @param {String} id - Launched browser ID
   * @returns {State}
   */
  launchBrowser(id) {
    if (!this.browsers.find(browser => browser.id === id)) {
      return this.set({
        browsers: this.browsers.concat(
          create(Browser, { id, launched: true })
        )
      });
    } else {
      return this;
    }
  }

  /**
   * Updates the name of a launched browser so that other connections
   * from the same browser can accurately update the proper states
   *
   * @param {Object} meta - Websocket meta from the sockets server
   * @param {String} id - Launched browser ID
   * @returns {State}
   */
  updateLaunched(meta, id) {
    let index = this.browsers.findIndex(browser => {
      return browser.launched && browser.id === id;
    });

    if (index > -1) {
      return this.set({
        browsers: update(this.browsers, index, browser => {
          return browser.set({ name: meta.browser });
        })
      });
    } else {
      return this;
    }
  }

  /**
   * Connects a websocket to a specific browser's state
   *
   * @param {Object} meta - Websocket meta from the sockets server
   * @returns {State}
   */
  connectBrowser(meta) {
    let index = this.browsers.findIndex(browser => {
      return browser.name === meta.browser;
    });

    let results = this.set({
      browsers: update(this.browsers, index, browser => {
        if (!browser) {
          browser = create(Browser, { name: meta.browser });
        }

        return browser.connect(meta.id);
      })
    });

    let ready = results.browsers
      .filter(browser => browser.launched)
      .every(browser => browser.connected);

    if (ready && !this.ready) {
      return results.set({ ready });
    } else {
      return results;
    }
  }

  /**
   * Disconnects a websocket from a specific browser's state
   *
   * @param {Object} meta - Websocket meta from the sockets server
   * @returns {State}
   */
  disconnectBrowser(meta) {
    let index = this.browsers.findIndex(browser => {
      return browser.name === meta.browser;
    });

    if (index > -1) {
      return this.set({
        browsers: update(this.browsers, index, browser => {
          return browser.disconnect(meta.id);
        })
      });
    } else {
      return this;
    }
  }

  /**
   * Transitions a browser into a running state and adds or updates
   * tests that have just started.
   *
   * @param {Object} meta - Websocket meta from the sockets server
   * @param {Object[]} tests - Array of test state properties
   * @returns {State}
   */
  startTests(meta, tests) {
    let index = this.browsers.findIndex(browser => {
      return browser.name === meta.browser;
    });

    if (index > -1) {
      let running = this.set({
        browsers: update(this.browsers, index, browser => {
          return browser.run(meta.id);
        })
      });

      return running.updateTests(meta, tests);
    } else {
      return this;
    }
  }

  /**
   * Updates tests for a specific browser
   *
   * @param {Object} meta - Websocket meta from the sockets server
   * @param {Object[]} tests - Array of test state properties
   * @returns {State}
   */
  updateTests(meta, tests) {
    return this.set({
      tests: tests.reduce((tests, test) => {
        let props = { browser: meta.browser, ...test };

        let index = this.tests.findIndex(test => {
          return test.name === props.name &&
            test.path.every((p, i) => p === props.path[i]);
        });

        return update(tests, index, test => {
          return test ? test.update(props) : create(Test, props);
        });
      }, this.tests)
    });
  }

  /**
   * Transitions a browser into a finished state
   *
   * @param {Object} meta - Websocket meta from the sockets server
   * @returns {State}
   */
  endTests(meta) {
    let index = this.browsers.findIndex(browser => {
      return browser.running && browser.name === meta.browser;
    });

    if (index > -1) {
      return this.set({
        browsers: update(this.browsers, index, browser => {
          return browser.done(meta.id);
        })
      });
    } else {
      return this;
    }
  }
}
