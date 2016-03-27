const dirname = require('path').dirname;
const resolve = require('path').resolve;
const resolveFromFile = require('resolve').sync;

/**
 * @param  {string} from
 * @param  {string} _to
 * @return {string}
 */
module.exports = function resolvePath(from, _to) {
  const to = purifyPath(_to);

  return isRelativePath(to)
    ? resolveFromFile(to, {basedir: dirname(from)})
    : resolve(dirname(from), to);
};

/**
 * @param  {string}  filepath
 * @return {boolean}
 */
function isRelativePath(filepath) {
  return /^\.(\.|\/|\\)/.test(filepath);
}

/**
 * @param  {string} filepath
 * @return {string}
 */
function purifyPath(filepath) {
  return filepath.replace(/^["']|["']$/g, '');
}
