'use strict';

module.exports = updateGenerics;

function updateGenerics(localGenerics, tokens) {
  for (const genericId in localGenerics) {
    const token = localGenerics[genericId];

    if (!tokens.hasOwnProperty(token)) continue;
    localGenerics[genericId] = tokens[token];
  }
}
