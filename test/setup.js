const postcss = require('postcss');
const relative = require('path').relative;

const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
const ResolveImports = require('../index');
const ExtractExports = require('postcss-modules-extract-exports');
const Values = require('postcss-modules-values');

global.assert = require('assert');
global.runner = function () {
  return postcss([
    Values,
    LocalByDefault,
    ExtractImports,
    new Scope({generateScopedName: (local, filename) =>
      Scope.generateScopedName(local, relative(process.cwd(), filename))}),
    ResolveImports,
    ExtractExports,
  ]);
};
