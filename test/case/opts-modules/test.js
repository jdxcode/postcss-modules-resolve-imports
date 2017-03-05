'use strict';

const {resolve} = require('path');
const resolveImports = require('../../../index');
const setup = require('../../setup');
const test = require('tape');

test('opts-modules', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    resolveImports({
      resolve: {
        modules: [resolve(__dirname, 'lib')],
      },
    })
  )(__dirname);

  t.equal(resulting.trim(), expected.trim());
  t.deepEqual(tokens, {continueButton: '_source_continueButton _index_button'});
  t.end();
});
