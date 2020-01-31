import { spawn } from 'child_process';
import { existsSync } from 'fs-extra';
import { when } from '@bigtest/convergence';

import { hasDescriptor } from './util/descriptors';
import binExists from './util/bin-exists';

const { assign } = Object;

/**
 * Wraps a child process so that it can be started with async start
 * and stop methods. Options can be provided directly, or this class
 * can be extended to provide getters instead. Getters for `cmd` and
 * `args` become `command` and `arguments`.
 *
 * @param {String} [name="child process"] - Name for this process
 * @param {Object} [env={}] - Environment variables to combine with the
 * current process's environment variables
 * @param {String|String[]} [options.cmd] - Command to use with `spawn`
 * @param {String[]} [options.args] - Arguments to use with `spawn`
 */
export default class ChildProcess {
  constructor({
    name = 'child process',
    env = {},
    cmd,
    args
  } = {}) {
    let properties = {
      piped: new Map()
    };

    if (!hasDescriptor(this, 'command')) {
      properties.command = cmd;
    }

    if (!hasDescriptor(this, 'arguments')) {
      properties.arguments = args;
    }

    if (!hasDescriptor(this, 'env')) {
      properties.env = env;
    }

    if (!hasDescriptor(this, 'name')) {
      properties.name = name;
    }

    assign(this, properties);
  }

  /**
   * True when there is a running process
   * @property {Boolean}
   */
  get running() {
    return !!(this.process && this.process.kill(0));
  }

  /**
   * Starts the child process using `spawn` with this instance's
   * `command` and `arguments` properties. If `command` is an array,
   * the first existing path or bin is used. An error is thrown if the
   * path or bin for a given command cannot be found.
   *
   * The resulting promise will resolve when the process closes or
   * reject if the process signals an `error` event while running.
   *
   * @returns {Promise} resolves after the process closes
   * @throws {Error} when the command cannot be found
   */
  async run() {
    if (this.running) return;

    // find the first existing path or bin
    let cmd = [].concat(this.command)
      .find(c => /\\|\//.test(c) ? existsSync(c) : binExists(c));
    let args = this.arguments || [];

    if (!cmd) {
      throw new Error('Command not found.');
    }

    let env = assign({}, process.env, this.env);

    // hangs around until the process exits and closes
    return new Promise((resolve, reject) => {
      let exited, closed;

      let done = err => {
        if (err || (exited && closed)) {
          this.process.removeListener('exit', handleExit);
          this.process.removeListener('close', handleClose);
          this.process.removeListener('error', done);
          this.process = null;

          if (err) {
            reject(err);
          } else if (exited && closed) {
            resolve();
          }
        }
      };

      let handleExit = code => {
        if (code > 0) {
          done(new Error(`Command failed with exit code ${code}.`));
        } else {
          exited = true;
          done();
        }
      };

      let handleClose = () => {
        closed = true;
        done();
      };

      this.process = spawn(cmd, args, { env });
      this.process.once('exit', handleExit);
      this.process.once('close', handleClose);
      this.process.once('error', done);
    });
  }

  /**
   * If the child process is running, kill it. Resolves once the close
   * event is emitted and the child process is no longer running.
   *
   * If the process takes longer than 2 seconds to close, SIGKILL is
   * sent, and will continue to be sent every 2 seconds until the
   * process finally closes.
   *
   * @param {String} [signal] - Optional signal to send to kill
   * @returns {Promise} resolves when the process is no longer running
   */
  async kill(signal) {
    if (this.running) {
      this.process.kill(signal);
    }

    try {
      await when(() => !this.running);
    } catch (e) {
      return this.kill('SIGKILL');
    }
  }

  /**
   * Pipes stdout and stderr from the child process. When either
   * stream produces output for the first time, a newline is inserted
   * to seperate any previous parent output.
   *
   * @param {Object} streams - Writable `stdout` and `stderr` to pipe
   */
  pipe(streams) {
    if (this.process && !this.piped.has(streams)) {
      let meta = { output: false };

      let listener = stream => data => {
        // buffer stream with a newline
        if (!meta.output) {
          streams[stream].write('\n');
          meta.output = stream;
        }

        // write to piped stream
        streams[stream].write(data);
      };

      this.piped.set(streams, assign(meta, {
        stdout: listener('stdout'),
        stderr: listener('stderr')
      }));

      this.process.stdout.on('data', meta.stdout);
      this.process.stderr.on('data', meta.stderr);
    }
  }

  /**
   * Unpipes stdout and stderr from the child process. If either
   * stream produced output, a newline is inserted to seperate any
   * future parent output.
   *
   * @param {Object} streams - Writable `stdout` and `stderr` to unpipe
   */
  unpipe(streams) {
    if (this.piped.has(streams)) {
      let meta = this.piped.get(streams);
      this.piped.delete(streams);

      // buffer last output stream with a newline
      if (meta.output) {
        streams[meta.output].write('\n');
      }

      if (this.process) {
        this.process.stdout.removeListener('data', meta.stdout);
        this.process.stderr.removeListener('data', meta.stderr);
      }
    }
  }
}
