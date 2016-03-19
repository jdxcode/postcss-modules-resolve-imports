const plugin = require('postcss').plugin;
const postcss = require('postcss');
const promisify = require('promisify-api');
const queue = require('async').queue;
const readFile = require('fs').readFile;
const requireResolve = require('resolve').sync;

const maxOpenFiles = 5;
const nameOfTheCurrentPlugin = 'postcss-modules-resolve-imports';

const exportRegexp = /^:export$/;
const importRegexp = /^:import\((.+)\)$/;

/**
 * @param  {object}  [opts]
 * @param  {object}  [opts._cache]
 * @param  {object}  [opts._trace]
 * @return {function}
 */
module.exports = plugin(nameOfTheCurrentPlugin, function postcssModulesResolveImports(opts) {
  // https://github.com/caolan/async#queueworker-concurrency
  const q = queue(worker, maxOpenFiles);
  const pushToQ = promisify(q.push, q);

  /**
   * @param  {object} tree   Root node
   * @param  {object} result
   * @return {promise}
   */
  return function resolveImports(tree, result) {
    const plugins = retrievePluginsForParse(result.processor.plugins);
    const runner = postcss(plugins);

    const _trace = result.opts._trace || String.fromCharCode(0);
    const cache = result.opts._cache || {};
    const translations = {};

    const pending = [];
    var depNr = 0;

    // https://github.com/postcss/postcss/blob/master/docs/api.md#containerwalkrulesselectorfilter-callback
    tree.walkRules(importRegexp, rule => {
      const trance = _trace + String.fromCharCode(depNr++);
      const importsPath = resolveImportsPath(RegExp.$1, sourcePath);
      appendTo(pending, pushToQ({file: importsPath, runner, cache, trace}))
        .then(rs => {
          const tokens = rs.tokens || {};
          rule.walkDelcs(decl =>
            translations[decl.prop] = tokens[decl.value]);
        });

      tree.removeChild(rule);
    });

    return Promise.all(pending)
  };
});

/**
 * Reads file and process its content.
 * Caches and returns Root node.
 *
 * @param {object}   task
 * @param {function} cb
 */
function worker({ file, runner, cache, trace }, cb) {
  if (cache[file]) {
    return void cb(null, cache[file]);
  }

  readFile(file, 'utf8', (er, css) => {
    if (er) {
      return void cb(er);
    }

    runner
      .process(css, {from: file, _cache: cache})
      .then(rs => {
        cache[file] = rs.root;
        cb(null, rs.root);
      })
      .catch(cb);
  });
}

/**
 * @param  {array} plugins
 * @return {array}
 */
function retrievePluginsForParse(plugins) {
  const pluginsForParse = plugins.slice();
  var ln = pluginsForParse.length;

  while (pluginsForParse[--ln].postcssPlugin !== nameOfTheCurrentPlugin) {
    pluginsForParse.pop();
  }

  // clear exports
  return pluginsForParse.concat(postcssExtractExports);
}

/**
 * @param  {string} importsPath relative
 * @param  {string} sourcePath  absolute
 * @return {string}             absolute
 */
function resolveImportsPath(importsPath, sourcePath) {
  const imports = purifyPath(importsPath);
  const start = imports.substring(0, 2);

  if (start !== './' && start !== '..') {
    return requireResolve(imports, {basedir: dirname(sourcePath)});
  }

  return resolve(dirname(sourcePath), imports);
}

/**
 * @param  {string} importsPath
 * @return {string}
 */
function purifyPath(importsPath) {
  return importsPath.replace(/^["']|["']$/g, '');
}

/**
 * @param  {array}   queue
 * @param  {promise} promise
 * @return {promise}
 */
function appendTo(queue, promise) {
  queue.push(promise);
  return promise;
}

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
