const resolvePath = require('./resolvePath');
const importRegexp = /^:import\((.+)\)$/;

/**
 * @param {container} tree
 * @param {string}    originalPath
 * @param {function}  iterator
 */
module.exports = function walkImports(tree, originalPath, iterator) {
  var iteration = 0;

  // https://github.com/postcss/postcss/blob/master/docs/api.md#containerwalkrulesselectorfilter-callback
  tree.walkRules(importRegexp, rule => {
    iterator(resolvePath(originalPath, RegExp.$1), iteration++, rule);
    tree.removeChild(rule);
  });
};
