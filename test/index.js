const postcss = require('postcss');

const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
const ResolveImports = require('../index.js');
const RemoveExports = require('../removeExports');

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
      RemoveExports,
    ])
    .process(css, {from: resolve('test/cases/source.css')})
    .then(result => {
      console.log(result.root);
      console.log(result.css);
      done();
    })
    .catch(done);
  });
});
