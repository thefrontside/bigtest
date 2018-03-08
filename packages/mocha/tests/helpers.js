import path from 'path';
import { spawn } from 'child_process';

/**
 * Runs mocha in a child process with the specified arguments.
 * Uses the same mocha.opts file as the test suite.
 *
 * @param {[String]} args - array of strings as arguments
 * @returns {Promise} resolves when the child process has exited
 */
function mocha(args) {
  return new Promise((resolve, reject) => {
    let output = '';
    let listener = (data) => output += data;
    let mocha = spawn('mocha', ['--opts', './tests/mocha.opts', ...args]);

    mocha.stdout.on('data', listener);
    mocha.stderr.on('data', listener);
    mocha.on('error', reject);

    mocha.on('close', (code) => {
      resolve({
        output: output.split('\n').join('\n'),
        code: code
      });
    });

    return mocha;
  });
}

/**
 * Runs a test fixture and returns the results as JSON
 *
 * @param {String} fixture - the fixture file name and path
 * relative to `tests/fixtures`
 * @returns {Promise} resolves with JSON results from running
 * the fixture
 */
export function run(fixture) {
  let fixturePath = path.join('./tests/fixtures', fixture);

  return mocha(['--reporter', 'json', fixturePath]).then((res) => {
    try {
      var result = JSON.parse(res.output);
      result.code = res.code;
      return result;
    // if unparsable, it was probably an error we should log
    } catch (error) {
      console.error(res.output);
      throw error;
    }
  });
}
