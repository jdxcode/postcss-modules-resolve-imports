'use strict';

const resolveImports = require('../../../src/sync');
const setup = require('../../setup');
const test = require('tape');

test('opts-explicit-exports', t => {
  const {expected, resulting, exports: tokens} = setup(
    'local-by-default',
    'extract-imports',
    'scope',
    resolveImports({icssExports: true})
  )(__dirname);

  t.equal(resulting, expected);
  t.deepEqual(tokens, {
    continueButton: '_source_continueButton',
    userInput: '_source_userInput',
  });
  t.end();
});
