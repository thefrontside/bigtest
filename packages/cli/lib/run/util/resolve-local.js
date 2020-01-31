import path from 'path';
import { existsSync } from 'fs-extra';

/**
 * Checks for the a file in a local directory within this package
 * (browsers, adapters, reporters). If it doesn't exist locally,
 * attempt to resolve the absolute path using `require.resolve`.
 *
 * @private
 * @param {String} dir - Local directory to look in
 * @param {String} name - Name of local file, or module path
 * @returns {String} the module path, or null if not found
 */
export default function resolveLocal(type, name) {
  // locally, the directory is the pluralized type
  let local = path.join(__dirname, `../${type}s/${name}.js`);
  let module = existsSync(local) ? local : null;

  // if not local, try to resolve the name directly
  try { module = module || require.resolve(name); } catch (e) {}

  // throw our own error when the module cannot be found
  if (!module) throw new Error(`Cannot find ${type} "${name}"`);

  // return the module path
  return module;
}
