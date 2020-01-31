import os from 'os';
import path from 'path';
import { remove, mkdir, writeFile } from 'fs-extra';
import { when } from '@bigtest/convergence';

import ChildProcess from '../process';

const { assign } = Object;

/**
 * A browser is a process that has it's own temporary directory, and
 * can open a target URL to run tests.
 *
 * @extends ChildProcess
 */
export default class BaseBrowser extends ChildProcess {
  /**
   * Unique ID used by the state when connecting launched browsers
   * @property {String}
   */
  id = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  // browsers are not given child process options
  constructor(options = {}) {
    assign(super(), { options });
  }

  /**
   * Absolute path to the user's home directory
   * @property {String}
   */
  get homedir() {
    return os.homedir();
  }

  /**
   * Absolute path to this browser's personal temporary directory
   * @property {String}
   */
  get tmpdir() {
    let name = this.name.toLowerCase().replace(/\s/g, '-');
    return path.join(os.tmpdir(), `bigtest-${name}-${this.id}`);
  }

  /**
   * Writes content to a file within this browser's `tmpdir`
   *
   * @param {String} name - Name of the file, including extension
   * @param {String} content - File contents
   * @returns {Promise} resolves when the file is written
   */
  async writeFile(name, content) {
    await writeFile(path.join(this.tmpdir, name), content);
  }

  /**
   * Deletes and recreates this browser's temproary directory. If the
   * diractory does not yet exist, it will be created.
   *
   * @returns {Promise} resolves when the directory is (re)created
   */
  async cleanTmpDir() {
    await Promise.resolve()
      .then(() => remove(this.tmpdir))
      .then(() => mkdir(this.tmpdir));
  }

  /**
   * Hook called when launching, after the temporary directory has
   * been cleaned. The browser process will not be launched until this
   * hook resolves.
   *
   * @returns {Promise} this method may be asynchronous
   */
  async setup() {}

  /**
   * Set's this instance's target, cleans the temporary directory,
   * calls the `setup` method, and launches the browser process.
   *
   * @param {String} url - The browser's target URL
   * @returns {Promise} resolves once the browser process is running
   * @throws {Error} when running the process encounters an issue
   */
  async launch(url) {
    let error;

    if (this.running) return;
    this.target = url || '';

    await this.cleanTmpDir();
    await this.setup();

    // resolves when done running
    this.run().catch(err => { error = err; });

    // wait until we start running, or encounter an error
    await when(() => this.running || (!!error && throw error));
  }
}
