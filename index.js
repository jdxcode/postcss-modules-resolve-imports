const assign = require('lodash').assign;
const dirname = require('path').dirname;
const plugin = require('postcss').plugin;
const postcss = require('postcss');
const queue = require('async').queue;
const readFile = require('fs').readFile;
const reqResolve = require('resolve').sync;
const resolve = require('path').resolve;
const uniq = require('lodash').uniq;

const postcssExtractExports = require('postcss-modules-extract-exports');

const exportRegexp = /^:export$/;
const importRegexp = /^:import\((.+)\)$/;
const nameOfTheCurrentPlugin = 'postcss-modules-resolve-imports';
const MAX_OPEN_FILES = 20;

/**
 * @param  {object}  [opts]
 * @param  {boolean} opts.sync
 * @return {function}
 */
module.exports = plugin(nameOfTheCurrentPlugin, function postcssModulesResolveImports(opts) {
  // https://github.com/caolan/async#queueworker-concurrency
  const q = queue(function worker({ filename, runner, trace, cache, traces }, cb) {
    readFile(filename, (er, css) => {
      if (er) {
        return void cb(er);
      }

      runner
        .process(css, {from: filename, _trace: trace, _cache: cache, _traces: traces})
        .then(result => cb(null, result.root))
        .catch(cb);
    });
  }, MAX_OPEN_FILES);

  /**
   * @param {string} filename
   * @param {object} runner
   * @param {string} trace
   */
  function addToQueue(filename, runner, trace, cache, traces) {
    return new Promise((resolve, reject) => {
      q.push({ filename, runner, trace, cache, traces }, (er, tree) => {
        if (er) {
          return void reject(er);
        }

        resolve(tree);
      });
    });
  }

  /**
   * @param  {object} tree   Root node
   * @param  {object} result
   * @return {promise}
   */
  return function resolveImports(tree, result) {
    const plugins = retrievePluginsForParse(result.processor.plugins);
    const runner = postcss(plugins);

    const cache = result.opts._cache || {};
    const pending = [];
    // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
    const sourcePath = tree.source.input.file;
    const trace = result.opts._trace || String.fromCharCode(0);
    const traces = result.opts._traces || {};
    const translations = {};

    let depNr = 0;
    // https://github.com/postcss/postcss/blob/master/docs/api.md#containerwalkrulesselectorfilter-callback
    tree.walkRules(importRegexp, rule => {
      const _trace = trace + String.fromCharCode(depNr++);
      const importsPath = resolveImportsPath(RegExp.$1, sourcePath);

      traces[_trace] = importsPath;

      if (cache[importsPath]) {
        return cache[importsPath];
      }

      pending.push(addToQueue(importsPath, runner, _trace, cache, traces)
        .then(anotherTree => {
          const tokens = anotherTree.tokens || {};

          rule.walkDecls(decl => {
            translations[decl.prop] = tokens[decl.value];
          });

          cache[importsPath] = anotherTree;
          return anotherTree;
        }));

      tree.removeChild(rule);
    });

    return Promise.all(pending)
      .then(_ => {
        tree.walkRules(exportRegexp, rule => {
          rule.walkDecls(decl => {
            Object.keys(translations)
              .forEach(translation => decl.value = decl.value.replace(translation, translations[translation]));
          });
        });

        if (trace !== String.fromCharCode(0)) {
          return _;
        }

        const files = Object.keys(traces).sort(traceKeySorter).map(t => traces[t]);
        files.reverse();

        uniq(files).forEach(file => tree.prepend(cache[file].nodes));

        return tree;
      });
  };
});

/**
 * @param  {array} plugins
 * @return {array}
 */
function retrievePluginsForParse(plugins) {
  const pluginsForParse = plugins.slice();
  let ln = pluginsForParse.length;

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
    return reqResolve(imports, {basedir: dirname(sourcePath)});
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

// Sorts dependencies in the following way:
// AAA comes before AA and A
// AB comes after AA and before A
// All Bs come after all As
// This ensures that the files are always returned in the following order:
// - In the order they were required, except
// - After all their dependencies
function traceKeySorter(a, b) {
  if (a.length < b.length) {
    return a < b.substring(0, a.length) ? -1 : 1;
  } else if (a.length > b.length) {
    return a.substring(0, b.length) <= b ? -1 : 1;
  } else {
    return a < b ? -1 : 1;
  }
};
