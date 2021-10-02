import postcss from "postcss";
import { ExtractPlugin } from "./extractPlugin.js";

function createProcessor(plugins) {
  const selfposition = plugins.findIndex(bySelfName);
  const precedingPlugins = plugins.slice(0, selfposition);

  return postcss(precedingPlugins.concat(ExtractPlugin()));
}

function bySelfName(plugin) {
  return plugin.postcssPlugin === "postcss-modules-resolve-imports";
}

/**
 * dangerouslyPrevailCyclicDepsWarnings
 * icssExports
 * resolve.alias
 * resolve.extensions
 * resolve.modules
 */
export const ResolveImports = ({ icssExports, resolve = {} }= {}) => ({
  postcssPlugin: "postcss-modules-resolve-imports",
  Once(root, { result, Comment }) {
    const graph = {};
    const processor = createProcessor(result.processor.plugins);
    const rootPath = root.source.input.file;
    const rootTree = root.clone({ nodes: [] });

    ExtractPlugin().Once(root, {
      result: {
        opts: { from: rootPath, graph, resolve, rootPath, rootTree },
        processor,
      },
      Comment,
    });

    if (icssExports) {
      const exportRule = postcss.rule({
        raws: {
          before: "",
          between: "\n",
          semicolon: true,
          after: "\n",
        },
        selector: ":export",
      });

      Object.keys(root.exports).forEach((className) =>
        exportRule.append({
          prop: className,
          value: root.exports[className],
          raws: { before: "\n  " },
        })
      );

      rootTree.prepend(exportRule);
    }

    rootTree.exports = root.exports;
    result.root = rootTree;
  },
});
ResolveImports.postcss = true;
