import BaseReporter from './base';

export default class DotReporter extends BaseReporter {
  static options = 'dot';

  /**
   * When tests start, create a newline
   */
  onStart() {
    this.write('\n');
  }

  /**
   * When a test is finished, prints a character corresponding to the
   * test's status.
   *
   * @param {Test} test - Test state
   */
  onUpdate(test) {
    if (test.finished) {
      if (test.passing) {
        this.write(this.chalk.green('.'));
      } else if (test.failing) {
        this.write(this.chalk.red('F'));
      } else if (test.skipped) {
        this.write(this.chalk.white(','));
      }
    }
  }

  /**
   * When testing ends, prints a summary of the results along with any
   * errors encountered from failed tests.
   *
   * When a failing test is from multiple browsers, the browser name
   * is printed above the error message.
   *
   * @param {Test[]} tests - Array of Test states
   */
  onEnd(tests) {
    let c = this.chalk;

    let passing = tests.filter(t => t.passing);
    let failing = tests.filter(t => t.failing);
    let skipped = tests.filter(t => t.skipped);
    let duration = tests.reduce((d, t) => d + t.duration, 0);

    this
      .write('\n\n')
      .log(c`{green ${passing.length} passing} {gray ${duration}ms}`);

    if (failing.length) {
      this.log(c.red(`${failing.length} failing`));
    }

    if (skipped.length) {
      this.log(c.gray(`${skipped.length} skipped`));
    }

    if (failing.length) {
      this
        .write('\n')
        .log(c.white.bold.underline(`FAILED TESTS:`));

      this.printTests(failing, (fail, i) => {
        this
          .log(c.white.bold(`${i + 1}) ${fail.name}`))
          .write('\n');

        fail.errors.forEach((error, i) => {
          if (i > 0) this.write('\n');

          if (fail.all.length > 1) {
            this.log(c.gray(error.browser));
          }

          this.error(error);
        });

        // no newline for the last failure
        if (i < failing.length - 1) {
          this.write('\n');
        }
      });
    }

    this.write('\n');
  }
}
