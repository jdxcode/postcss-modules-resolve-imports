'use strict';

const {difference, flatten, forEach, keys, mapValues, values} = require('lodash');

const PERMANENT_MARK = 2;
const TEMPORARY_MARK = 1;
const UNMARKED = 0;

module.exports = topologicalSort;

function topologicalSort(nodes) {
  const deps = flatten(values(nodes));
  const start = difference(keys(nodes), deps);
  const tree = mapValues(nodes, edges => ({edges, mark: UNMARKED}));

  return dfs(tree, start);
}

function dfs(tree, nodeIds) {
  const sorted = [];

  forEach(nodeIds, nodeId => visit(tree, sorted, nodeId));

  return sorted;
}

function visit(tree, sorted, nodeId) {
  const node = tree[nodeId];

  // if (node.mark === TEMPORARY_MARK) // cycle
  if (node.mark) return;
  node.mark = TEMPORARY_MARK;

  const childIds = node.edges;

  forEach(childIds, childId => visit(tree, sorted, childId));
  node.mark = PERMANENT_MARK;
  sorted.push(nodeId);
}
