'use strict';

/**
 * Notes about postcss plugin's api
 *
 * Containers are iterated with .walk* methods.
 * - Rule is actually a selector.
 * - AtRule usually is rule, that starts from '@'.
 * - Decl are actually css rules (keys prop, value).
 *
 * @see  http://api.postcss.org/AtRule.html#walkRules
 */

const {dirname, relative} = require('path');
const {comment, plugin} = require('postcss');
const {readFileSync} = require('fs');
const {resolveModule} = require('./resolveModule');
const {resolvePaths, normalizeUrl} = require('./resolvePaths');
const postcss = require('postcss');

const extractPlugin = plugin('extract-plugin', () => resolveDeps);

const PERMANENT_MARK = 2;
const TEMPORARY_MARK = 1;
// const UNMARKED = 0;

const importDeclaration = /^:import\((.+)\)$/;
const moduleDeclaration = /^:(?:export|import\(.+\))$/;

module.exports = plugin('postcss-modules-resolve-imports', resolveImportsPlugin);

/**
 * dangerouslyPrevailCyclicDepsWarnings
 * icssExports
 * resolve.alias
 * resolve.extensions
 * resolve.modules
 */
function resolveImportsPlugin({icssExports, resolve = {}} = {}) {
  return resolveImports;

  function resolveImports(ast, result) {
    const graph = {};
    const processor = createProcessor(result.processor.plugins);
    const rootPath = ast.source.input.file;
    const rootTree = ast.clone({nodes: []});

    resolveDeps(ast, {opts: {from: rootPath, graph, resolve, rootPath, rootTree}, processor});

    if (icssExports) {
      const exportRule = postcss.rule({
        raws: {
          before: '',
          between: '\n',
          semicolon: true,
          after: '\n',
        },
        selector: ':export',
      });

      Object.keys(ast.exports).forEach(className =>
        exportRule.append({
          prop: className,
          value: ast.exports[className],
          raws: {before: '\n  '},
        }));

      rootTree.prepend(exportRule);
    }

    rootTree.exports = ast.exports;
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

/**
 * Topological sorting is used to resolve the deps order,
 * actually depth-first search algorithm.
 *
 * @see  https://en.wikipedia.org/wiki/Topological_sorting
 */
function resolveDeps(ast, result) {
  const {
    from: selfPath,
    graph,
    resolve,
    rootPath,
    rootTree,
  } = result.opts;

  const cwd = dirname(selfPath);
  const rootDir = dirname(rootPath);
  const processor = result.processor;
  const self = graph[selfPath] = graph[selfPath] || {};

  self.mark = TEMPORARY_MARK;

  const moduleExports = {};
  const translations = {};

  ast.walkRules(moduleDeclaration, rule => {
    if (importDeclaration.exec(rule.selector)) {
      rule.walkDecls(decl => translations[decl.prop] = decl.value);

      const dependencyPath = RegExp.$1.replace(/['"]/g, '');
      const absDependencyPath = resolveModule(dependencyPath, {cwd, resolve});

      if (!absDependencyPath) throw new Error(
        'Can\'t resolve module path from `' +
        cwd + '` to `' + dependencyPath + '`'
      );

      if (
        graph[absDependencyPath] &&
        graph[absDependencyPath].mark === TEMPORARY_MARK
      ) throw new Error(
        'Circular dependency was found between `' +
        selfPath + '` and `' + absDependencyPath + '`. ' +
        'Circular dependencies lead to the unpredictable state and considered harmful.'
      );

      if (!(
        graph[absDependencyPath] &&
        graph[absDependencyPath].mark === PERMANENT_MARK
      )) {
        const css = readFileSync(absDependencyPath, 'utf8');
        const lazyResult = processor.process(css, Object.assign({}, result.opts, {from: absDependencyPath}));

        updateTranslations(translations, lazyResult.root.exports);
      } else {
        updateTranslations(translations, graph[absDependencyPath].exports);
      }

      return void rule.remove();
    }

    rule.walkDecls(decl => moduleExports[decl.prop] = decl.value);
    rule.remove();
  });

  for (const token in moduleExports)
    for (const genericId in translations)
      moduleExports[token] = moduleExports[token]
        .replace(genericId, translations[genericId]);

  self.mark = PERMANENT_MARK;
  self.exports = ast.exports = moduleExports;

  // resolve paths
  if (cwd !== rootDir) resolvePaths(ast, cwd, rootDir);

  const importNotes = comment({
    parent: rootTree,
    raws: {before: rootTree.nodes.length === 0 ? '' : '\n\n'},
    text: ` imported from ${normalizeUrl(relative(rootDir, selfPath))} `,
  });

  const childNodes = ast.nodes.map(i => {
    const node = i.clone({parent: rootTree});

    if (
      typeof node.raws.before === 'undefined' ||
      node.raws.before === ''
    ) node.raws.before = '\n\n';

    return node;
  });

  rootTree.nodes = rootTree.nodes.concat(importNotes, childNodes);
}

function updateTranslations(translations, tokens) {
  for (const genericId in translations) {
    const token = translations[genericId];

    if (tokens.hasOwnProperty(token))
      translations[genericId] = tokens[token];
  }
}
