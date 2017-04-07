'use strict';

const {
  applyAliases,
  isDirectory,
  isFile,
  isNodeModule,
  nodeModulesPaths,
  resolveAsDir,
  resolveAsFile,
  resolveModule,
} = require('../../src/resolveModule');
const {parse, resolve} = require('path');
const test = require('tape');

test('applyAliases', t => {
  t.equal(applyAliases('a'), 'a');
  t.equal(applyAliases('a', {a: 'b'}), 'b');
  t.end();
});

test('isDirectory', t => {
  t.ok(isDirectory(__dirname));
  t.notOk(isDirectory(`${__dirname}fake`));
  t.end();
});

test('isFile', t => {
  t.ok(isFile(resolve(__dirname, 'resolveModule.test.js')));
  t.notOk(isFile(resolve(__dirname, 'fake.js')));
  t.end();
});

test('isNodeModule', t => {
  t.notOk(isNodeModule('.'));
  t.notOk(isNodeModule('..'));
  t.notOk(isNodeModule('../awesome.css'));
  t.notOk(isNodeModule('./awesome.css'));
  t.notOk(isNodeModule('/'));
  t.notOk(isNodeModule('C:\\my-dir'));
  t.notOk(isNodeModule('d:\\my-dir'));
  t.ok(isNodeModule('@sullenor/eslint-config'));
  t.ok(isNodeModule('lodash'));
  t.ok(isNodeModule('lodash/curry'));
  t.end();
});

test('nodeModulesPaths', t => {
  const parsed = parse(__dirname);
  const paths = nodeModulesPaths(__dirname);

  t.equal(paths[0], resolve(__dirname, 'node_modules'));
  t.equal(paths[paths.length - 1], resolve(parsed.root, 'node_modules'));
  t.end();
});

test('resolveAsDir', t => {
  t.equal(resolveAsDir(resolve(__dirname, 'node_modules/awesome')),
    resolve(__dirname, 'node_modules/awesome/index.css'));
  t.equal(resolveAsDir(resolve(__dirname, 'node_modules/main')),
    resolve(__dirname, 'node_modules/main/main.css'));
  t.end();
});

test('resolveAsFile', t => {
  t.equal(resolveAsFile(resolve(__dirname, 'node_modules/awesome/index'), ['.css']),
    resolve(__dirname, 'node_modules/awesome/index.css'));
  t.end();
});

test('resolveModule', t => {
  t.equal(resolveModule('awesome', {cwd: __dirname}),
    resolve(__dirname, 'node_modules/awesome/index.css'));
  t.equal(resolveModule('awesome/index.css', {cwd: __dirname}),
    resolve(__dirname, 'node_modules/awesome/index.css'));
  t.equal(resolveModule('main', {cwd: __dirname}),
    resolve(__dirname, 'node_modules/main/main.css'));
  t.end();
});
