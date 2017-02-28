'use strict';

const setup = require('../../setup');
const test = require('tape');

test('identity', t => {
  const {expected, resulting} = setup()(__dirname);

  t.equal(resulting, expected);
  t.end();
});
