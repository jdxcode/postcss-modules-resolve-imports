import { readFileSync } from "fs";
import { basename, resolve } from "path";
import postcss from 'postcss';

import cssmodulesLocalByDefault from "postcss-modules-local-by-default";
import cssmodulesExtractImports from "postcss-modules-extract-imports";
import cssmodulesScope from "postcss-modules-scope";
import cssmodulesValues from "postcss-icss-values";
import {ResolveImports} from "../src/index.js";

const LOADER = {
  values: () => cssmodulesValues,
  "local-by-default": () => cssmodulesLocalByDefault,
  "extract-imports": () => cssmodulesExtractImports,
  scope: () => cssmodulesScope({ generateScopedName }),
  self: () => ResolveImports(),
};

export default function setup(...plugins) {
  const loadedPlugins = plugins.map((name) =>
    typeof name === "string" ? LOADER[name]() : name
  );

  return setupCase;

  function setupCase(directory) {
    const runner = postcss(loadedPlugins);
    const sourcepath = resolve(directory, "source.css");

    const source = readFileSync(sourcepath, "utf8");
    const lazyResult = runner.process(source, { from: sourcepath });

    return {
      exports: lazyResult.root.exports,
      resulting: lazyResult.css.replace(/\r/g, ""),
      source,
    };
  }
}

function generateScopedName(local, filename) {
  return `_${basename(filename).split(".").shift()}_${local}`;
}
