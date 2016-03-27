const assign = require('lodash').assign;
const dirname = require('path').dirname;
const find = require('lodash').find;
const forEach = require('lodash').forEach;
const glob = require('glob').sync;
const groupBy = require('lodash').groupBy;
const readFile = require('fs').readFileSync;
const resolve = require('path').resolve;

/**
 * specify particular test cases using the glob pattern,
 * for example: 'multiple*'
 */
const ONLY = '';

generate((name, files) => {
  const optsPath = find(files, file => /source\.json$/.test(file));
  const sourcePath = find(files, file => /source\.css$/.test(file));
  const expectedCSSPath = find(files, file => /expected\.css$/.test(file));
  const expectedTokensPath = find(files, file => /expected\.json$/.test(file));

  suite(name, () => {
    var resultingCSS;
    var resultingTokens;

    before(done => {
      const css = readFile(sourcePath, 'utf8');
      const opts = optsPath ? require(optsPath) : {};

      runner()
      .process(css, assign({from: sourcePath}, opts))
      .then(result => {
        resultingCSS = result.css;
        resultingTokens = result.root.tokens;
        done();
      })
      .catch(done);
    });

    test('resulting css should be equal expected', () => {
      const css = readFile(expectedCSSPath, 'utf8');
      assert.equal(resultingCSS.trim(), css.trim());
    });

    test('result tokens should be equal expected', () => {
      const tokens = require(expectedTokensPath);
      assert.deepEqual(resultingTokens, tokens);
    });
  });
});

/**
 * @param {function} generator
 */
function generate(generator) {
  const basepath = resolve(__dirname, 'cases');

  suite('postcss-modules-resolve-imports', () => {
    forEach(getTestCases(ONLY), (files, name) =>
      generator(name, files.map(file => resolve(basepath, file))));
  });
}

/**
 * @param  {string} [particular]
 * @return {object}
 */
function getTestCases(particular) {
  const basepath = resolve(__dirname, 'cases');
  const scope = particular && typeof particular === 'string'
    ? particular
    : '*';

  const files = glob(`${scope}/{expected.*,source*.*}`, {cwd: basepath});

  return groupBy(files, dirname);
}
