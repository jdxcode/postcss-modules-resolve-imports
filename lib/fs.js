'use strict';

const { readdir, readFile } = require('fs');
const promisify = require('promisify-api');

exports.readdir = promisify(readdir);
exports.readFile = promisify(readFile);
