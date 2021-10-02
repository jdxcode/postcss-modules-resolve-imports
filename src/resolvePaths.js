import {parseValues, stringifyValues} from 'css-selector-tokenizer';
import {relative, resolve, sep} from 'path';

const isNonRootUrl = filepath => !/^\//.test(filepath);
const isRelativeUrl = filepath => /^(?:\.\.?(?:[\\/]|$))/.test(filepath);

export function normalizeUrl(value) {
  return value.replace(/\\/g, '/');
}

export function iterateValues(values, iteratee) {
  values.nodes.forEach(value =>
    value.nodes.forEach(item => iteratee(item)));
}

export function resolvePaths(ast, from, to) {
  // @import
  ast.walkAtRules(atrule => {
    if (atrule.name === 'import') {
      const values = parseValues(atrule.params);

      iterateValues(values, item => {
        if (item.type === 'string' && isNonRootUrl(item.value))
          item.value = resolveUrl(item.value, from, to);

        if (item.type === 'url' && isNonRootUrl(item.url))
          item.url = resolveUrl(item.url, from, to);
      });

      atrule.params = stringifyValues(values);
    }
  });

  // background: url(..)
  ast.walkDecls(decl => {
    if (/url/.test(decl.value)) {
      const values = parseValues(decl.value);

      iterateValues(values, item => {
        if (item.type === 'url' && isNonRootUrl(item.url))
          item.url = resolveUrl(item.url, from, to);
      });

      decl.value = stringifyValues(values);
    }
  });
}

export function resolveUrl(url, from, to) {
  const resolvedUrl = relative(to, resolve(from, url));

  return normalizeUrl(
    isRelativeUrl(url)
    ? '.' + sep + resolvedUrl
    : resolvedUrl
  );
}
