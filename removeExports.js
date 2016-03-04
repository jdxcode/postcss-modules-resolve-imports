const plugin = require('postcss').plugin;

const exportRegexp = /^:export$/;

module.exports = plugin('remove-exports', function removeExports() {
  return css => {
    css.walkRules(exportRegexp, rule => css.removeChild(rule));
    return css;
  };
});
