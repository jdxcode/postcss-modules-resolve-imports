'use strict';

const { basename, resolve } = require('path');
const { compose, map } = require('lodash/fp');
const { partial } = require('lodash');
const { readdir, readFile } = require('../lib/fs');
const cssModules = require('./cssModules');
const postcss = require('postcss');
const terminate = require('../lib/terminate');
const test = require('tape');

const casedir = resolve(__dirname, 'cases');
const resolveToAbsolute = partial(resolve, casedir);
const runTestCase = map(compose(testCase, loadAssets, resolveToAbsolute));

readdir(casedir)
  .then(runTestCase)
  .catch(terminate);

/**
 * @param  {string} casepath
 * @return {promise}
 */
function loadAssets(casepath) {
  const sourcepath = resolve(casepath, 'source.css');
  const expectedpath = resolve(casepath, 'expected.css');

  return Promise.all([
    casepath,
    sourcepath,
    loadAsset(sourcepath),
    loadAsset(expectedpath),
  ]);
}

/**
 * @todo    add userfriendly error message
 * @param  {string} asset
 * @return {promise}
 */
function loadAsset(asset) {
  return readFile(asset, 'utf8');
}

/**
 * @param  {promise} promise
 * @return {promise}
 */
function testCase(promise) {
  return promise
    .then(([ casepath, sourcepath, source, expected ]) =>
      test(basename(casepath), t => {
        t.isEqual(processCss(source, sourcepath), expected);
        t.end();
      }));
}

/**
 * @param  {string} css
 * @param  {string} filepath
 * @return {string}
 */
function processCss(css, filepath) {
  return postcss([cssModules]).process(css, {from: filepath}).css;
}
