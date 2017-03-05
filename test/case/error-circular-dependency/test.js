'use strict';

const setup = require('../../setup');
const test = require('tape');

test('error-circular-dependency', t => {
  t.throws(() => setup(
    'local-by-default',
    'extract-imports',
    'scope',
    'self'
  )(__dirname));

  t.end();
});
