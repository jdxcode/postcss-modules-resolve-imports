'use strict';

const {basename} = require('path');

function generateScopedName(local, filename) {
  return `_${basename(filename).split('.').shift()}_${local}`;
}

module.exports = [
  'local-by-default',
  'extract-imports',
  [
    'scope',
    {
      generateScopedName,
    },
  ],
  [
    'self',
    {
      resolve: {
        extensions: ['.css'],
      },
    },
  ],
];
