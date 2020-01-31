/**
 * Splits a string on space characters except spaces within quoted
 * portions of the string.
 *
 * @param {String} str - The string to split
 * @returns {String[]} the split string
 */
export default function splitStringArgs(str) {
  return str.match(/"[^"]*"|\S+/g).map(arg => {
    return arg.replace(/^("|')(.*)(\1)$/, '$2');
  });
}
