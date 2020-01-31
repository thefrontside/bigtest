import chalk from 'chalk';

const { assign } = Object;

/**
 * Escapes special regular expression characters in a string.
 *
 * @private
 * @param {String} str - String to escape
 * @returns {String} escaped string ready for regexp interpolation
 */
function escape(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Formats an error's stack trace to remove the name & message, and
 * strip indentation.
 *
 * @private
 * @param {Error|Object} error - Error object or other object with
 * name, message and stack properties
 * @returns {String} formatted error stack
 */
function formatErrorStack({ name, message, stack }) {
  return stack.replace(RegExp([
    // remove any lines including the typical error message
    `(^.*(${escape(name)}).*(${escape(message)}).*$)`,
    // dedent the entire stack
    '(^\\s*(?!$))'
  ].join('|'), 'gm'), '').trim();
}

/**
 * The base reporter class that other reporters must extend.
 *
 * @param {Writable} [options.out=process.stdout] - Stream to write to
 * @param {Boolean} [options.colors=true] - Whether to enable chalk colors
 * @param {Object} [...options] - Remaining options
 */
export default class Reporter {
  constructor({
    out = process.stdout,
    colors = true,
    ...options
  } = {}) {
    assign(this, {
      chalk: chalk.constructor({ enabled: colors }),
      options,
      out,

      // internal state
      _newline: true,
      _indent: ''
    });
  }

  /**
   * Enables or disables chalk colors
   * @property {Boolean}
   */
  set colors(value) {
    return (this.chalk.enabled = !!value);
  }

  get colors() {
    return this.chalk.enabled;
  }

  /**
   * Sets the indentation length in spaces for future write operations
   *
   * @param {Number} length - Amount of spaces to indent
   * @returns {Reporter} this instance for chaining
   */
  indent(length) {
    if (typeof length === 'undefined') {
      return this._indent.length;
    } else {
      this._indent = ('').padStart(length, ' ');
      return this;
    }
  }

  /**
   * Resets the reporter's indentation
   * @returns {Reporter} this instance for chaining
   */
  dedent() {
    this._indent = '';
    return this;
  }

  /**
   * Writes multiple strings to the output stream, indenting the
   * string after any newline characters are output.
   *
   * @param {String} [...strings] - Strings to output
   * @returns {Reporter} this instance for chaining
   */
  write(...strings) {
    let indent = this._indent;
    let newline = this._newline;

    strings = strings.map(str => {
      // indent each line in a string
      return str.split('\n').map((line, i, lines) => {
        // if a newline was output and this line has content, indent
        line = newline && !!line.trim() ? `${indent}${line}` : line;
        // we have a newline if this one is empty, or there are more
        newline = !line.trim() || lines.length - 1 > i;
        return line;
      }).join('\n');
    });

    this.out.write(strings.join(''));
    this._newline = newline;
    return this;
  }

  /**
   * Writes multiple messages to the output stream followed by newlines
   *
   * @param {String} [...messages] - Message to log with newlines
   * @returns {Reporter} this instance for chaining
   */
  log(...messages) {
    return this.write(...messages.map(msg => `${msg}\n`));
  }

  /**
   * Writes an error to the output stream. If colors are enabled, the
   * error message will be red. If there is an error stack, it will be
   * indented further and made gray if colors are enabled.
   *
   * @param {String|Object} error - Error string or object
   * @param {Number} [indent=2] - Error stack indentation
   * @returns {Reporter} this instance for chaining
   */
  error(error, indent = 2) {
    let c = this.chalk;

    if (typeof error === 'string') {
      this.write(c`{red ${error}}`);
    } else if (typeof error === 'object') {
      this.write(c`{red ${error.name}: ${error.message}}`);

      if (error.stack) {
        this
          .indent(this.indent() + indent)
          .write('\n', c.gray(formatErrorStack(error)))
          .indent(this.indent() - indent);
      }
    }

    this.write('\n');
    return this;
  }

  /**
   * Processes previous and resulting states, invoking hooks when
   * specific differences are found.
   *
   * @private
   * @param {State} prev - Previous state
   * @param {State} next - Resulting state
   */
  process(prev, next) {
    // tests started
    if (!prev.started && next.started) {
      this.onStart(next.tests);
      // tests finished
    } else if (!prev.finished && next.finished) {
      this.onEnd(next.tests);
      // tests added or updated
    } else if (prev.tests !== next.tests) {
      // check for test updates
      next.tests.forEach((nextTest, i) => {
        if (prev.tests[i] !== nextTest) {
          this.onUpdate(nextTest);
        }
      });
    }
  }

  /**
   * Called when browsers have started running tests
   *
   * @param {Test[]} tests - Current state of all tests
   */
  onStart() {}

  /**
   * Called when a specific test has changed in some way
   *
   * @param {Test} test - Test found to have changed
   */
  onUpdate() {}

  /**
   * Called when browsers have finished running tests
   *
   * @param {Test[]} tests - Current state of all tests
   */
  onEnd() {}

  /**
   * Given an array of tests with paths, will print each path and
   * intelligently nest tests under common paths.
   *
   * @param {Test[]} tests - Array of test states with paths
   * @param {Function} print - Function called with a specific test to
   * print information under nested paths.
   */
  printTests(tests, print) {
    let indent = this._indent;
    let last;

    // loop over tests, printing their paths
    for (let i = 0, l = tests.length; i < l; i++) {
      let test = tests[i];

      // print the nested path for this test
      for (let ii = 0, ll = test.path.length; ii < ll; ii++) {
        this.indent(indent + (ii * 2));

        // only print a path if it defers from the last path
        if (!last || last.path[ii] !== test.path[ii]) {
          this.log(test.path[ii]);
        }
      }

      this.indent(indent + (test.path.length * 2));
      print(test, i);
      last = test;
    }

    // clean up indentation
    this.indent(indent);
    return this;
  }
}
