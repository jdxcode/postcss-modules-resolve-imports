const chain = require('lodash').chain;

/**
 * @param  {object} deps
 * @return {string[]}
 */
module.exports = function resolveDeps(deps) {
  return chain(deps)
  .keys()
  .sort(traceKeySorter)
  .map(key => deps[key])
  .uniq()
  .reverse()
  .value();
};

/**
 * Sorts dependencies in the following way:
 * AAA comes before AA and A
 * AB comes after AA and before A
 * All Bs come after all As
 * This ensures that the files are always returned in the following order:
 * - In the order they were required, except
 * - After all their dependencies
 *
 * @param  {string} a
 * @param  {string} b
 * @return {number}
 */
function traceKeySorter(a, b) {
  if (a.length < b.length) {
    return a < b.substring(0, a.length) ? -1 : 1;
  } else if (a.length > b.length) {
    return a.substring(0, b.length) <= b ? -1 : 1;
  } else {
    return a < b ? -1 : 1;
  }
};
