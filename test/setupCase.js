'use strict';

const {readFileSync} = require('fs');
const {resolve} = require('path');
const postcss = require('postcss');

module.exports = setupCase;

function setupCase(...plugins) {
  return setup;

  function setup(directory) {
    const runner = postcss(plugins);
    const sourcepath = resolve(directory, 'source.css');
    const expectedpath = resolve(directory, 'expected.css');

    const source = readFileSync(sourcepath, 'utf8');
    const expected = readFileSync(expectedpath, 'utf8');
    const resulting = runner.process(source, {from: sourcepath}).css;

    return {expected, resulting, source};
  }
}
