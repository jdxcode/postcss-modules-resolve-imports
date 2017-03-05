'use strict';

const {resolve} = require('path');
const resolveImports = require('../../../index');
const setup = require('../../setup');
const test = require('tape');

test('opts-alias', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    resolveImports({
      resolve: {
        // alias: {
        //   button: resolve(__dirname, 'lib/button/button.css'),
        // },
      },
    })
  )(__dirname);

  t.equal(resulting.trim(), expected.trim());
  t.deepEqual(tokens, {continueButton: '_source_continueButton _button_button'});
  t.end();
});
