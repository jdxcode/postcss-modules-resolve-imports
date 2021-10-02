import {join, parse, resolve} from 'path';
import {readFileSync, statSync, realpathSync} from 'fs';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
  boolean: ['preserve-symlinks'],
});

const PRESERVE_SYMLINKS = argv['preserve-symlinks'] ||
  String(process.env.NODE_PRESERVE_SYMLINKS) === '1';

export function applyAliases(filepath, aliases = {}) {
  const keys = Object.keys(aliases);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];

    if (filepath.startsWith(key)) return filepath.replace(key, aliases[key]);
  }

  return filepath;
}

export function isDirectory(filepath) {
  try {
    return statSync(filepath).isDirectory();
  } catch (er) {
    if (er && er.code === 'ENOENT') return false;
    throw er;
  }
}

export function isFile(filepath) {
  try {
    return statSync(filepath).isFile();
  } catch (er) {
    if (er && er.code === 'ENOENT') return false;
    throw er;
  }
}

// ../ | ./ | / | c:\
export function isNodeModule(filepath) {
  return !/^(?:\.\.?(?:[\\/]|$)|\/|[A-Za-z]:[\\/])/.test(filepath);
}

function nodeModulesPaths(start) {
  const paths = [start];
  let parsed = parse(start);

  while (parsed.dir !== parsed.root) {
    paths.push(parsed.dir);
    parsed = parse(parsed.dir);
  }

  paths.push(parsed.root);

  return paths.map(directory => join(directory, 'node_modules'));
}

export function resolveAsDir(filepath, mainFile = 'index.css') {
  const pkgfile = join(filepath, 'package.json');

  if (isFile(pkgfile)) {
    const body = readFileSync(pkgfile, 'utf8');

    try {
      const pkg = JSON.parse(body);

      if (pkg.main) return resolveAsFile(join(filepath, pkg.main)) ||
        resolveAsDir(join(filepath, pkg.main), mainFile);
    } catch (e) {} // eslint-disable-line no-empty
  }

  return resolveAsFile(join(filepath, mainFile));
}

export function resolveAsFile(filepath, extensions = []) {
  if (isFile(filepath)) return filepath;

  for (let i = 0; i < extensions.length; ++i) {
    const extension = extensions[i];
    const file = filepath + extension;

    if (file === filepath) continue;
    if (isFile(file)) return file;
  }
}

export function resolveModule(filepath, {cwd, resolve: resolvecfg = {}}) {
  const preserveSymlinks = resolvecfg.preserveSymlinks !== undefined
    ? Boolean(resolvecfg.preserveSymlinks) : PRESERVE_SYMLINKS;
  const file = applyAliases(filepath, resolvecfg.alias);
  const dirs = isNodeModule(file)
    ? (resolvecfg.modules || []).concat(nodeModulesPaths(cwd))
    : (resolvecfg.modules || []).concat(cwd);

  for (let i = 0; i < dirs.length; ++i) {
    const directory = dirs[i];

    if (!isDirectory(directory)) continue;

    const abspath = resolve(directory, file);
    const result = resolveAsFile(abspath, resolvecfg.extensions) ||
      resolveAsDir(abspath, resolvecfg.mainFile);

    if (result) return preserveSymlinks ? result : realpathSync(result);
  }
}
