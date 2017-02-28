'use strict';

const setupCase = require('../../setupCase');
const test = require('tape');

test('identity', t => {
  const {expected, resulting} = setupCase();

  t.equal(resulting, expected);
  t.end();
});
