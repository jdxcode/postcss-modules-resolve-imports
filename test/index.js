const basename = require('path').basename;
const postcss = require('postcss');
const readdirSync = require('fs').readdirSync;
const readFileSync = require('fs').readFileSync;
const relative = require('path').relative;
const resolve = require('path').resolve;

const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
const ResolveImports = require('../index');
const ExtractExports = require('postcss-modules-extract-exports');

const runner = postcss([
  LocalByDefault,
  ExtractImports,
  new Scope({generateScopedName: (local, filename) =>
    Scope.generateScopedName(local, relative(process.cwd(), filename))}),
  ResolveImports,
  ExtractExports,
]);

/**
 * @param {string} testCase
 */
function describeTest(testCase) {
  const source = readfile(testCase, 'source.css');
  const expected = readfile(testCase, 'expected.css');
  if (expected === null) {
    return;
  }

  const expectedTokens = JSON.parse(readfile(testCase, 'expected.json'));

  // if (basename(testCase) !== 'nested-imports-should-be-first') {
  //   return;
  // }

  // @todo add a small shortcut to choose certain tests
  test(basename(testCase), done => {
    const root = runner
      .process(source, {from: resolve(testCase, 'source.css')})
      .then(result => {
        assert.equal(result.css, expected);
        assert.deepEqual(result.root.tokens, expectedTokens);
        done();
      })
      .catch(done);
  });
}

/**
 * @param  {string} dir
 * @return {string[]}
 */
function readdir(dir) {
  return readdirSync(resolve(__dirname, dir))
    .map(nesteddir => resolve(__dirname, dir, nesteddir));
}

/**
 * @param  {...string} file
 * @return {string|null}
 */
function readfile(file) {
  try {
    return readFileSync(resolve.apply(null, arguments), 'utf8');
  } catch(e) {
    return null;
  }
}

suite('postcss-modules-resolve-imports', () => {
  readdir('./cases').forEach(describeTest);
});
