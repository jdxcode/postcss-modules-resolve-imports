'use strict';

const setup = require('../../setup');
const test = require('tape');

test('resolve-package-main', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    'self'
  )(__dirname);

  t.equal(resulting, expected);
  t.deepEqual(tokens, {continueButton: '_source_continueButton _my-awesome-button_button'});
  t.end();
});
