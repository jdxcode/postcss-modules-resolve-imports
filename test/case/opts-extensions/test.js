'use strict';

const resolveImports = require('../../../src/sync');
const setup = require('../../setup');
const test = require('tape');

test('opts-extensions', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    resolveImports({
      resolve: {
        extensions: ['.css'],
      },
    })
  )(__dirname);

  t.equal(resulting, expected);
  t.deepEqual(tokens, {continueButton: '_source_continueButton _button_button'});
  t.end();
});
