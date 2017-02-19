'use strict';

const {plugin} = require('postcss');

module.exports = plugin('postcss-modules-resolve-imports', resolveImportsPlugin);

function resolveImportsPlugin({resolve}) {
  // normalize opts
  return resolveImports;

  function resolveImports(root, result) {
    // walk imports, memorise files and tokens
  }
}
