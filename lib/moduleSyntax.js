'use strict';

const importDeclaration = /^:import\((.+)\)$/;
const moduleDeclaration = /^:(?:export|import\(.+\))$/;

exports.importDeclaration = importDeclaration;
exports.moduleDeclaration = moduleDeclaration;

exports.extractFilepath = extractFilepath;
exports.isExportDecl = isExportDecl;

function extractFilepath(selector) {
  const filepath = importDeclaration.exec(selector) && RegExp.$1.replace(/['"]/g, '');

  return filepath;
}

function isExportDecl(selector) {
  return selector === ':export';
}
