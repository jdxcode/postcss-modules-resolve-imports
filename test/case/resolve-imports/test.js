'use strict';

const setupCase = require('../../setupCase');
const test = require('tape');

test('resolve-imports', t => {
  const {expected, resulting} = setupCase()(__dirname);

  t.equal(resulting, expected);
  t.end();
});
