'use strict';

const {readdirSync, readFileSync} = require('fs');
const {resolve} = require('path');
const postcss = require('postcss');

const postcssLocalByDefault = require('postcss-modules-local-by-default');
const postcssExtractImports = require('postcss-modules-extract-imports');
const postcssScope = require('postcss-modules-scope');
const postcssResolveImportsAsync = require('../lib/async');
const postcssResolveImportsSync = require('../lib/sync');

const casesdir = resolve(__dirname, 'case');
const whitelist = [];

describe('cases', () => {
  const cases = readdirSync(casesdir);

  cases.forEach(casename => {
    if (whitelist.length && !whitelist.includes(casename)) return;

    describe(casename.replace(/[^\w]/g, ' '), () => {
      const sourceFilepath = resolve(casesdir, casename, 'source.css');
      const expectedFilepath = resolve(casesdir, casename, 'expected.css');

      let source;
      let expected;
      let pluginsList;

      beforeAll(() => {
        source = readFileSync(sourceFilepath, 'utf8');
        expected = readFileSync(expectedFilepath, 'utf8');
        pluginsList = require(resolve(casesdir, casename, 'plugins.js'));
      });

      it('async', () => {
        const plugins = resolveAsyncPlugins(pluginsList);
        const lazyResult = postcss(plugins).process(source, {from: sourceFilepath});

        return lazyResult.then(result => {
          expect(normalize(result.css)).toEqual(expected);
        });
      });

      it('sync', () => {
        const plugins = resolveSyncPlugins(pluginsList);
        const lazyResult = postcss(plugins).process(source, {from: sourceFilepath});

        expect(normalize(lazyResult.css)).toEqual(expected);
      });
    });
  });
});

function castArray(value) {
  return Array.isArray(value)
    ? value
    : [value];
}

function resolveAsyncPlugins(list) {
  const resolutions = {
    'local-by-default': postcssLocalByDefault,
    'extract-imports': postcssExtractImports,
    scope: postcssScope,
    self: postcssResolveImportsAsync,
  };

  return list.map(castArray).map(([pluginName, opts = {}]) => {
    const plugin = resolutions[pluginName];

    if (!plugin) throw new Error('Unknown plugin `' + pluginName + '`');

    return plugin(opts);
  });
}

function resolveSyncPlugins(list) {
  const resolutions = {
    'local-by-default': postcssLocalByDefault,
    'extract-imports': postcssExtractImports,
    scope: postcssScope,
    self: postcssResolveImportsSync,
  };

  return list.map(castArray).map(([pluginName, opts = {}]) => {
    const plugin = resolutions[pluginName];

    if (!plugin) throw new Error('Unknown plugin `' + pluginName + '`');

    return plugin(opts);
  });
}

function normalize(string) {
  return string.replace(/\r/g, '');
}
