const basename = require('path').basename;
const readdirSync = require('fs').readdirSync;
const readFileSync = require('fs').readFileSync;
const resolve = require('path').resolve;

// global from setup
const processor = runner();

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
    const root = processor
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
