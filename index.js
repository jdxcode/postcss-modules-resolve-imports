const plugin = require('postcss').plugin;

const importRegexp = /^:import\((.+)\)$/;

/**
 * @param  {object}  [opts]
 * @param  {boolean} opts.sync
 * @return {function}
 */
module.exports = plugin('postcss-modules-resolve-imports', function postcssModulesResolveImports(opts) {
  return function resolveImports(css, result) {
    // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
    const filepath = css.source.input.file;
    const plugins = result.processor.plugins;

    css.walkRules(importRegexp, rule => {
      const dependency = RegExp.$1.replace(/^["']|["']$/g, '');

      // Шаги -> Резолвим путь -> Загружаем содержимое -> Прогоняем через postcss -> Достаем Root
      // -> Резолвим зависимости -> Вставляем ноды в исходное дерево (желательно использовать tracesort)
      // Получается, нужен кэш с файлами и конечный резолвер на случай, когда файлы загружены.
      //
      // По сути можно хранить список файлов и их контент + отдельно помечать глубину загрузки

      // path RegExp.$1
    });

    return css;
  };
});
