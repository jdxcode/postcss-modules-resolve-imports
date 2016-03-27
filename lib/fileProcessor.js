const assign = require('lodash').assign;
const postcss = require('postcss');

/**
 * @param  {function} readFile
 * @param  {object}   runner
 * @param  {object}   options
 * @return {function}
 */
module.exports = function fileProcessor(readFile, plugins, options) {
  const cache = {};
  const traces = {};
  const runner = postcss(plugins);

  /**
   * @param  {string} originalPath
   * @param  {string} trace
   * @return {promise}
   */
  function processFile(originalPath, trace) {
    traces[trace] = originalPath;

    if (cache[originalPath]) {
      return Promise.resolve(cache[originalPath]);
    }

    return readFile(originalPath)
    .then(css => runner
      .process(css, assign(options, {from: originalPath, processFile, trace})))
    .then(result => {
      cache[originalPath] = result.root;
      return result.root;
    });
  };

  processFile.cache = cache;
  processFile.traces = traces;

  return processFile;
};
