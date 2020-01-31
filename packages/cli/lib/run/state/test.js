import create, { update } from './create';

const { assign } = Object;

/**
 * Represents the status of a test for a specific browser
 */
export class BrowserTest {
  /**
   * The browser's name
   * @property {String}
   */
  browser = 'Unknown';

  /**
   * Determines if we need to initialize as a specific BrowserTest
   * subclass instance.
   *
   * @param {Object} props - Properties passed to `create`
   * @returns {BrowserTest}
   */
  initialize(props) {
    return this.update(props);
  }

  /**
   * Conditionally transitions this instance into a different
   * BrowserTest subclass instance.
   *
   * @param {Object} props - Properties to transition with
   * @returns {BrowserTest}
   */
  update(props) {
    let pending = !(
      props.running ||
      props.passing ||
      props.failing ||
      props.skipped
    );

    let extended = assign({}, this, props);

    if (!this.running && props.running) {
      return create(RunningBrowserTest, extended);
    } else if (!this.passing && props.passing) {
      return create(PassingBrowserTest, extended);
    } else if (!this.failing && props.failing) {
      return create(FailingBrowserTest, extended);
    } else if (!this.skipped && props.skipped) {
      return create(SkippedBrowserTest, extended);
    } else if (!this.pending && pending) {
      return create(BrowserTest, extended);
    } else {
      return this;
    }
  }

  /**
   * True when a browser test is not in a running, passing, failing,
   * or skipped state.
   * @property {Boolean}
   */
  get pending() {
    return !(
      this.running ||
      this.passing ||
      this.failing ||
      this.skipped
    );
  }

  /**
   * True when a browser test is not running, and is in a passing,
   * failing, or skipped state.
   * @property {Boolean}
   */
  get finished() {
    return !this.running && !!(
      this.passing ||
      this.failing ||
      this.skipped
    );
  }
}

/**
 * Reprisents a running browser test
 */
export class RunningBrowserTest extends BrowserTest {
  /**
   * @constant {Boolean}
   * @default
   */
  running = true;
}

/**
 * Reprisents a passing browser test
 */
export class PassingBrowserTest extends BrowserTest {
  /**
   * @constant {Boolean}
   * @default
   */
  passing = true;

  /**
   * Duration it took the browser to run this test
   * @property {Number}
   */
  duration = 0;
}

/**
 * Reprisents a skipped browser test
 */
export class SkippedBrowserTest extends BrowserTest {
  /**
   * @constant {Boolean}
   * @default
   */
  skipped = true;
}

/**
 * Reprisents a skipped browser test
 */
export class FailingBrowserTest extends BrowserTest {
  /**
   * @constant {Boolean}
   * @default
   */
  failing = true;

  /**
   * Duration it took the browser to run this test
   * @property {Number}
   */
  duration = 0;

  /**
   * Errors encountered causing the browser test to fail
   * @property {BrowserError[]}
   */
  errors = [];

  /**
   * When initialized, errors are mapped into BrowserError instances
   *
   * @param {Object} props - Properties passed to `create`
   * @returns {FailingBrowserTest}
   */
  initialize(props) {
    if (props.errors && props.errors.length) {
      return this.set({
        errors: props.errors.map(err => {
          let { name, message, stack } = err;

          return create(BrowserError, {
            browser: this.browser,
            name,
            message,
            stack
          });
        })
      });
    } else {
      return this;
    }
  }
}

/**
 * Represents an error encountered during a browser test
 */
export class BrowserError {
  /**
   * Error name
   * @property {String}
   */
  name = 'Error';

  /**
   * Error message
   * @property {String}
   */
  message = 'unknown error';

  /**
   * Error origin browser
   * @property {String}
   */
  browser = 'Unknown';

  /**
   * Error stack trace
   * @property {String}
   */
  stack = null;
}

/**
 * Represents the state of a test in all browsers
 */
export default class Test {
  /**
   * The name of this test
   * @property {String}
   */
  name = '';

  /**
   * The test path (nested suites)
   * @property {String[]}
   */
  path = [];

  /**
   * All browser specific tests
   * @property {BrowserTest[]}
   */
  all = [];

  /**
   * The longest duration it took for the test to run in all browsers
   * @property {Number}
   */
  get duration() {
    return this.all.reduce((duration, test) => {
      return Math.max(duration, test.duration || 0);
    }, 0);
  }

  /**
   * True when all browsers' test are pending
   * @property {Boolean}
   */
  get pending() {
    return this.all.every(test => test.pending);
  }

  /**
   * True when all browsers' test are finished
   * @property {Boolean}
   */
  get finished() {
    return this.all.every(test => test.finished);
  }

  /**
   * True when some browsers' test are running
   * @property {Boolean}
   */
  get running() {
    return this.all.some(test => test.running);
  }

  /**
   * True when all browsers' test are passing
   * @property {Boolean}
   */
  get passing() {
    return this.all.every(test => test.passing);
  }

  /**
   * True when some browsers' test are failing
   * @property {Boolean}
   */
  get failing() {
    return this.all.some(test => test.failing);
  }

  /**
   * True when all browsers' test are skipped
   * @property {Boolean}
   */
  get skipped() {
    return this.all.every(test => test.skipped);
  }

  /**
   * Errors encountered by all browsers when failing
   * @property {BrowserError[]}
   */
  get errors() {
    return this.all.reduce((errors, test) => {
      return test.failing ? errors.concat(test.errors) : errors;
    }, []);
  }

  /**
   * Maybe initialize the test with a pre-existing browser
   *
   * @param {Object} props - Properties passed to `create`
   * @returns {Test}
   */
  initialize(props) {
    if (props.browser) {
      return this.update(props);
    } else {
      return this;
    }
  }

  /**
   * Updates or creates a new BrowserTest
   *
   * @param {Object} props - Properties for a BrowserTest
   * @returns {Test}
   */
  update(props) {
    let index = this.all.findIndex(test => {
      return test.browser === props.browser;
    });

    return this.set({
      all: update(this.all, index, test => {
        return test ? test.update(props) : create(BrowserTest, props);
      })
    });
  }
}
