import { spawnSync } from 'child_process';

/**
 * Uses `which` in a child process to determin if a bin exists
 *
 * @param {String} bin - Executable bin name
 * @returns {Boolean} true when the bin exists
 */
export default function binExists(bin) {
  let results = spawnSync('which', [bin]);
  return results.status === 0;
}
