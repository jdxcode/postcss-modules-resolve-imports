'use strict';

const setup = require('../../setup');
const test = require('tape');

test('resolve-multiple-imports', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    'self'
  )(__dirname);

  t.equal(resulting, expected);
  t.deepEqual(tokens, {
    resultA: '_source_resultA _b_aa _a_aa _c_aa',
    resultB: '_source_resultB _c_bb _b_bb',
  });
  t.end();
});
