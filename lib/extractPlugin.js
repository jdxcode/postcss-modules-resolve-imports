'use strict';

const {PERMANENT_MARK, TEMPORARY_MARK} = require('./marks');
const {extractFilepath, isExportDecl, moduleDeclaration} = require('./moduleSyntax');
const {dirname} = require('path');
const {plugin} = require('postcss');
const {readFileSync} = require('fs');
const {resolveModule} = require('./resolveModule');
const updateGenerics = require('./updateGenerics');

module.exports = plugin('extract-plugin', function extractPlugin() {
  return depsExtractor;

  function depsExtractor(ast, result) {
    const {nodes, from: selfPath, rootPath, rootTree} = result.opts;
    const processor = result.processor;
    const self = nodes[selfPath] = nodes[selfPath] || {};

    // Красим в серый
    self.mark = TEMPORARY_MARK;

    const localExports = {};
    const localGenerics = {};

    ast.walkRules(moduleDeclaration, rule => {
      if (!isExportDecl(rule.selector)) {
        rule.walkDecls(decl => localGenerics[decl.prop] = decl.value);

        const dependencyPath = extractFilepath(rule.selector);
        const absDependencyPath = resolveModule(dependencyPath, {cwd: dirname(selfPath), resolve: {}});

        if (!absDependencyPath) throw new Error('Can not resolve ' + dependencyPath + ' from ' + dirname(selfPath));

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
          const dependencyResult = processor.process(css, Object.assign({}, result.opts, {from: absDependencyPath}));

          updateGenerics(localGenerics, dependencyResult.root.exports);
        }
      } else {
        rule.walkDecls(decl => localExports[decl.prop] = decl.value);
      }

      rule.remove();
    });

    // Красим в черный
    self.mark = PERMANENT_MARK;
    // Обновляем текущие экспорты
    for (const token in localExports)
      for (const genericId in localGenerics)
        localExports[token] = localExports[token]
          .replace(genericId, localGenerics[genericId]);

    self.exports = ast.exports = localExports;
    // Пушим в конец дерева
    rootTree.append(ast.nodes);
  }
});
