'use strict';

const setup = require('../../setup');
const test = require('tape');

test('resolve-imports', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    'self'
  )(__dirname);

  t.equal(resulting.trim(), expected.trim());
  t.deepEqual(tokens, {body: '_source_body _nnn_aaa _aaa_bbb _nnn_bbb'});
  t.end();
});
