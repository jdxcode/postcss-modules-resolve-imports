'use strict';

const { plugin } = require('postcss');

module.exports = plugin('postcss-modules-resolve-imports',
  resolveImportsPlugin);

/**
 * @param  {object} opts
 * @return {function}
 */
function resolveImportsPlugin(opts) {
  return resolveImports;
}

function resolveImports(tree, result) {
  // body...
}
