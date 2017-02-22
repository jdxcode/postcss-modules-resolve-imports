'use strict';

const topologicalSort = require('../../lib/topologicalSort');
const test = require('tape');

test('topologicalSort', t => {
  // a -> b -> c
  //     /    /
  //    d    e
  const tree1 = {
    a: ['b'],
    b: ['c'],
    c: [],
    d: ['b'],
    e: ['c'],
  };

  t.deepEqual(topologicalSort(tree1), ['c', 'b', 'a', 'd', 'e']);
  t.end();
});

test('topologicalSort2', t => {
  // a -> b -> c
  //  \  /    /
  //   d  -> e
  const tree1 = {
    a: ['b', 'd'],
    b: ['c'],
    c: [],
    d: ['b', 'e'],
    e: ['c'],
  };

  t.deepEqual(topologicalSort(tree1), ['c', 'b', 'e', 'd', 'a']);
  t.end();
});
