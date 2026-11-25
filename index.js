'use strict';

const path = require('node:path');
const { objectTransform } = require('through2');

const generate = require('./lib/generate');

function identityMap() {

  function transform(file, _, cb) {
    if (!file.sourceMap || !file.isBuffer()) {
      return cb(null, file);
    }

    const sourcePath = file.relative.split(path.sep).join('/');
    const contents = file.contents.toString();

    switch (file.extname) {
      case '.js': {
        file.sourceMap = generate.js(sourcePath, contents);
        break;
      }
      case '.css': {
        file.sourceMap = generate.css(sourcePath, contents);
        break;
      }
    }

    cb(null, file);
  }

  return objectTransform(transform);
}

module.exports = identityMap;
