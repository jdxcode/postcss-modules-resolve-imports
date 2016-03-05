const dirname = require('path').dirname;
const forEach = require('lodash');
const plugin = require('postcss').plugin;
const postcss = require('postcss');
const readFile = require('fs').readFile;
const readFileSync = require('fs').readFileSync;
const resolve = require('path').resolve;

const importRegexp = /^:import\((.+)\)$/;
const nameOfTheCurrentPlugin = 'postcss-modules-resolve-imports';

/**
 * @param  {object}  [opts]
 * @param  {boolean} opts.sync
 * @return {function}
 */
module.exports = plugin(nameOfTheCurrentPlugin, function postcssModulesResolveImports(opts) {
  return function resolveImports(tree, result) {
    const from = tree.source.input.file;
    const plugins = getPluginsForParse(result.processor.plugins);
    const runner = postcss(plugins);

    tree.walkRules(importRegexp, rule => {
      const to = resolve(dirname(from), RegExp.$1.replace(/^["']|["']$/g, ''));
      const css = readFileSync(to, 'utf8');
      const root = runner.process(css, {from: to}).root;
      tree.prepend(root.nodes);
      tree.removeChild(rule);
    });

    return tree;
  };
});

/**
 * @param  {array} plugins
 * @return {array}
 */
function getPluginsForParse(plugins) {
  const pluginsForParse = plugins.slice();
  let ln = pluginsForParse.length;

  while (pluginsForParse[--ln].postcssPlugin !== nameOfTheCurrentPlugin) {
    pluginsForParse.pop();
  }

  return pluginsForParse;
}

// /**
//  * @param  {object}  [opts]
//  * @param  {boolean} opts.sync
//  * @return {function}
//  */
// module.exports = plugin(nameOfTheCurrentPlugin, function postcssModulesResolveImports(opts) {
//   return function resolveImports(tree, result) {
//     // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
//     // const filepath = tree.source.input.file;
//     const plugins = getPluginsForParse(result.processor.plugins);
//     const runner = postcss(plugins);

//     const cache = {};
//     const queue = [];
//     const traces = {};

//     traverseImports(tree, dependency =>
//       loadDependency(dependency, {cache, queue, runner}));

//     return Promise.all(queue)
//       .then(_ => combineTrees(tree, cache));

//     // -> traceKeySorter
//   };
// });

// /**
//  * @param  {array} plugins
//  * @return {array}
//  */
// function getPluginsForParse(plugins) {
//   const pluginsForParse = plugins.slice();
//   let ln = pluginsForParse.length;

//   while (pluginsForParse[--ln].postcssPlugin !== nameOfTheCurrentPlugin) {
//     pluginsForParse.pop();
//   }

//   return pluginsForParse;
// }

// /**
//  * @param  {root}     tree
//  * @param  {function} iterator
//  */
// function traverseImports(tree, iterator) {
//   // https://github.com/postcss/postcss/blob/master/docs/api.md#inputfile
//   const source = tree.source.input.file;
//   // https://github.com/postcss/postcss/blob/master/docs/api.md#containerwalkrulesselectorfilter-callback
//   tree.walkRules(importRegexp, rule => {
//     iterator(getDepsPath(RegExp.$1, source), source);
//     tree.removeChild(rule);
//   });
// }

// /**
//  * @param  {string} to
//  * @param  {string} from
//  * @return {string}
//  */
// function getDepsPath(to, from) {
//   // @todo support non-relative imports
//   // const filepath = /\w/i.test(to[0])
//   //   ? require.resolve(to)
//   //   : resolve(dirname(from), to);
//   return resolve(dirname(from), to.replace(/^["']|["']$/g, ''));
// }

// /**
//  * @param  {string} dependency
//  * @param  {object} options.cache
//  * @param  {array}  options.queue
//  */
// function loadDependency(dependency, {cache, queue, runner}) {
//   const pending = new Promise((resolve, reject) =>
//     readFile(dependency, 'utf8', (er, source) => {
//       if (er) {
//         return void reject(er);
//       }

//       runner
//         .process(source, {from: dependency})
//         .then(result => {
//           cache[dependency] = result.root;

//           traverseImports(result.root, deps =>
//             loadDependency(deps, {cache, queue, runner}));

//           resolve(result.root);
//         })
//         .catch(reject);
//     }));

//   queue.push(pending);
//   return pending;
// }

// function combineTrees(root, cache) {
//   forEach(cache, tree => root.prepend.apply(root, tree.nodes));
//   console.log('test', root)
//   return root;
// }

// // Sorts dependencies in the following way:
// // AAA comes before AA and A
// // AB comes after AA and before A
// // All Bs come after all As
// // This ensures that the files are always returned in the following order:
// // - In the order they were required, except
// // - After all their dependencies
// function traceKeySorter(a, b) {
//   if (a.length < b.length) {
//     return a < b.substring(0, a.length) ? -1 : 1;
//   } else if (a.length > b.length) {
//     return a.substring(0, b.length) <= b ? -1 : 1;
//   } else {
//     return a < b ? -1 : 1;
//   }
// };
