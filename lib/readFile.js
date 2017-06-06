'use strict';

const fs = require('fs');

module.exports = readFile;

function readFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) return void reject(err);
      resolve(data);
    });
  });
}
