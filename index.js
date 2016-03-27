const fileProcessor = require('./lib/fileProcessor');
const plugin = require('postcss').plugin;
const queue = require('async').queue;
const promisify = require('promisify-api');
const readFile = require('fs').readFile;
const resolveDeps = require('./lib/resolveDeps');
const updateExports = require('./lib/updateExports');
const walkImports = require('./lib/walkImports');

const postcssExtractExports = require('postcss-modules-extract-exports');
const postcssResolveDeps = plugin('resolve-dependency-imports', function () {
  return function resolveDependencyImports(tree, result) {
    // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
    const originalPath = tree.source.input.file;
    const pending = [];
    const processFile = result.opts.processFile;
    const trace = result.opts.trace;
    const translations = {};

    walkImports(tree, originalPath, (filepath, i, rule) => {
      const _trace = trace + String.fromCharCode(i);
      pending.push(processFile(filepath, _trace)
      .then(result => {
        const tokens = result.tokens || {};
        rule.walkDecls(decl =>
          translations[decl.prop] = tokens[decl.value]);
      }));
    });

    return Promise.all(pending)
    .then(() => updateExports(tree, translations));
  };
});

const MAX_OPEN_FILES = 50;
const nameOfTheCurrentPlugin = 'postcss-modules-resolve-imports';

/**
 * @param  {object} opts
 * @param  {number} opts.maxOpenFiles
 * @return {function}
 */
module.exports = plugin(nameOfTheCurrentPlugin, function (opts) {
  const maxOpenFiles = opts && typeof opts.maxOpenFiles === 'number'
    ? opts.maxOpenFiles
    : MAX_OPEN_FILES;

  const q = queue(readFile, maxOpenFiles);
  const queueFile = promisify(q.push, q);

  return function resolveImports(tree, result) {
    const plugins = retrievePluginsForParse(result.processor.plugins);
    const processFile = fileProcessor(queueFile, plugins);

    // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
    const originalPath = tree.source.input.file;
    const pending = [];
    const trace = String.fromCharCode(0);
    const translations = {};

    walkImports(tree, originalPath, (filepath, i, rule) => {
      const _trace = trace + String.fromCharCode(i);
      pending.push(processFile(filepath, _trace)
      .then(result => {
        const tokens = result.tokens || {};
        rule.walkDecls(decl =>
          translations[decl.prop] = tokens[decl.value]);
      }));
    });

    return Promise.all(pending)
    .then(() => updateExports(tree, translations))
    .then(() => resolveDeps(processFile.traces))
    .then(files => {
      const cache = processFile.cache;
      return Promise.all(files.map(file => cache[file]))
      .then(containers => containers.forEach(container =>
        tree.prepend(container.nodes)));
    });
  };
});

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

  pluginsForParse.pop();

  return pluginsForParse.concat(postcssResolveDeps, postcssExtractExports);
}
