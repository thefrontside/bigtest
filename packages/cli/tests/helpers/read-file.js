import { readFile } from 'fs-extra';

/**
 * The same as `readFile`, but defaults encoding to utf-8
 *
 * @param {String} file - Filename to read
 * @param {Object} [options={}] - Additional options
 */
export default async function(file, options = {}) {
  return readFile(file, { encoding: 'utf-8', ...options });
};
