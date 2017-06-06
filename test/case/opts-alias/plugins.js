'use strict';

const {basename, resolve} = require('path');

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
        alias: {
          button: resolve(__dirname, 'lib/button/button.css'),
        },
      },
    },
  ],
];
