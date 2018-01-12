import path from 'path';
import { spawn } from 'child_process';

/**
 * Runs QUnit in a child process with the specified arguments.
 *
 * @param {[String]} args - array of strings as arguments
 * @returns {Promise} resolves when the child process has exited
 */
function qunit(args) {
  return new Promise((resolve, reject) => {
    let output = '';
    let listener = (data) => output += data;
    let qunit = spawn('qunit'); // TODO: revisit how to call qunit

    qunit.stdout.on('data', listener);
    qunit.stderr.on('data', listener);
    qunit.on('error', reject);

    qunit.on('close', (code) => {
      resolve({
        output: output.split('\n').join('\n'),
        code: code
      });
    });

    return qunit;
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

  return qunit(['--reporter', 'json', fixturePath]).then((res) => {
    var result = JSON.parse(res.output);
    result.code = res.code;
    return result;
  });
}
