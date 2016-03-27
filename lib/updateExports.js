const exportRegexp = /^:export$/;
const forEach = require('lodash').forEach;

/**
 * @param  {container} tree
 * @param  {object}    translations
 */
module.exports = function updateExports(tree, translations) {
  // https://github.com/postcss/postcss/blob/master/docs/api.md#containerwalkrulesselectorfilter-callback
  tree.walkRules(exportRegexp, rule => {
    rule.walkDecls(decl => {
      forEach(translations, (translation, key) =>
        decl.value = decl.value.replace(key, translation));
    });
  });
};
