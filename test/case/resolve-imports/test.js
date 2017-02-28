'use strict';

const setup = require('../../setup');
const test = require('tape');

test('resolve-imports', t => {
  const {expected, resulting} = setup(
    'local-by-default',
    'extract-imports',
    'scope'
  )(__dirname);

  t.equal(resulting, expected);
  t.end();
});
