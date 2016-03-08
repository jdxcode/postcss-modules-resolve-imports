const postcss = require('postcss');

const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
const ResolveImports = require('../index.js');
const ExtractExports = require('postcss-modules-extract-exports');

const readFileSync = require('fs').readFileSync;
const resolve = require('path').resolve;

const css = readFileSync(resolve('test/cases/source.css'), 'utf8');

suite('prove of concept', () => {
  test('give me a hope', done => {
    postcss([
      LocalByDefault,
      ExtractImports,
      Scope,
      ResolveImports,
      ExtractExports,
    ])
    .process(css, {from: resolve('test/cases/source.css')})
    .then(result => {
      console.log(result.root.tokens);
      console.log(result.css);
      done();
    })
    .catch(done);
  });
});
