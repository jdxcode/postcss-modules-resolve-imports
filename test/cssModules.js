'use strict';

const { plugin } = require('postcss');
const { relative } = require('path');
const postcss = require('postcss');

const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
// const ResolveImports = require('../index');
const ExtractExports = require('postcss-modules-extract-exports');
const Values = require('postcss-modules-values');

module.exports = plugin('css-modules', function initCssModules() {
  const runner = postcss([
    Values,
    LocalByDefault,
    ExtractImports,
    new Scope({generateScopedName: (local, filename) =>
      Scope.generateScopedName(local, relative(process.cwd(), filename))}),
    // ResolveImports,
    ExtractExports,
  ]);

  return cssModules;

  function cssModules(css) {
    return runner.process(css, {from: css.source.input.file}).css;
  }
});
