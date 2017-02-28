'use strict';

const {readFileSync} = require('fs');
const {basename, relative, resolve} = require('path');
const postcss = require('postcss');

const CASEDIR = resolve(__dirname, 'case');
const LOADER = {
  'local-by-default': () => require('postcss-modules-local-by-default'),
  'extract-imports': () => require('postcss-modules-extract-imports'),
  'scope': () => new require('postcss-modules-scope')({generateScopedName}),
  'self': () => require('../index.js'),
};

module.exports = setup;

function setup(...plugins) {
  const loadedPlugins = plugins.map(name => LOADER[name]());

  return setupCase;

  function setupCase(directory) {
    const runner = postcss(loadedPlugins);
    const sourcepath = resolve(directory, 'source.css');
    const expectedpath = resolve(directory, 'expected.css');

    const source = readFileSync(sourcepath, 'utf8');
    const expected = readFileSync(expectedpath, 'utf8');
    const resulting = runner.process(source, {from: sourcepath}).css;

    return {expected, resulting, source};
  }
}

function generateScopedName(local, filename) {
  return `_${basename(filename).split('.').shift()}_${local}`

  return '_' + relative(CASEDIR, filename).replace(/[\\\/]/g, '_').split('.').shift();
}
