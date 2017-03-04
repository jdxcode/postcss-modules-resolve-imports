'use strict';

/**
 * Notes about postcss plugin's api
 *
 * Containers are iterated with .walk* methods.
 * Rules are actually selectors.
 * Decls are actually css rules (keys prop, value).
 */

const {PERMANENT_MARK, TEMPORARY_MARK} = require('./lib/marks');
const {dirname} = require('path');
const {extractFilepath, isExportDecl, moduleDeclaration} = require('./lib/moduleSyntax');
const {plugin} = require('postcss');
const {readFileSync} = require('fs');
const {resolveModule} = require('./lib/resolveModule');
const extractPlugin = require('./lib/extractPlugin');
const postcss = require('postcss');
const updateGenerics = require('./lib/updateGenerics');

module.exports = plugin('postcss-modules-resolve-imports', resolveImportsPlugin);

/**
 * dangerouslyPrevailCyclicDepsWarnings
 * resolve.alias
 * resolve.extensions
 */
function resolveImportsPlugin({resolve} = {}) {
  // normalize opts
  return resolveImports;

  function resolveImports(ast, result) {
    const rootPath = ast.source.input.file;
    const rootTree = postcss.root();

    const nodes = {rootPath: {mark: PERMANENT_MARK}};

    const localGenerics = {};
    const localExports = {};
    const processor = createProcessor(result.processor.plugins);

    ast.walkRules(moduleDeclaration, rule => {
      if (!isExportDecl(rule.selector)) {
        rule.walkDecls(decl => localGenerics[decl.prop] = decl.value);

        const dependencyPath = extractFilepath(rule.selector);
        const absDependencyPath = resolveModule(dependencyPath, {cwd: dirname(rootPath), resolve});

        if (!absDependencyPath) throw new Error('Can not resolve ' + dependencyPath + ' from ' + dirname(rootPath));

        // Смотрим цвет -> черный, то оставляем, серый -> цикл
        if (
          nodes[absDependencyPath] &&
          nodes[absDependencyPath].mark === TEMPORARY_MARK || // цикл
          nodes[absDependencyPath] &&
          nodes[absDependencyPath].mark === PERMANENT_MARK // достаем сразу экспорты и идем дальше
        ) {
          updateGenerics(localGenerics, nodes[absDependencyPath].exports);
        } else {
          const css = readFileSync(absDependencyPath, 'utf8');
          const dependencyResult = processor.process(css, {from: absDependencyPath, nodes, rootPath, rootTree});

          updateGenerics(localGenerics, dependencyResult.root.exports);
        }
      } else {
        rule.walkDecls(decl => localExports[decl.prop] = decl.value);
      }

      rule.remove();
    });

    nodes.rootPath.mark = PERMANENT_MARK;
    // Обновляем текущие экспорты
    for (const token in localExports)
      for (const genericId in localGenerics)
        localExports[token] = localExports[token]
          .replace(genericId, localGenerics[genericId]);

    rootTree.exports = localExports;
    rootTree.append(ast.nodes);
    result.root = rootTree;
  }
}

function createProcessor(plugins) {
  const selfposition = plugins.findIndex(bySelfName);
  const precedingPlugins = plugins.slice(0, selfposition);

  return postcss(precedingPlugins.concat(extractPlugin));
}

function bySelfName(plugin) {
  return plugin.postcssPlugin === 'postcss-modules-resolve-imports';
}
