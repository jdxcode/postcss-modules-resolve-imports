'use strict';

/**
 * Notes about postcss plugin's api
 *
 * Containers are iterated with .walk* methods.
 * Rules are actually selectors.
 * Decls are actually css rules (keys prop, value).
 */

const {plugin} = require('postcss');

module.exports = plugin('postcss-modules-resolve-imports', resolveImportsPlugin);

function resolveImportsPlugin({resolve} = {}) {
  // normalize opts
  return resolveImports;

  function resolveImports(ast, result) {}
}
