'use strict';

const acorn = require('acorn');
const postcss = require('postcss');
const { SourceMapGenerator } = require('source-map-js');

function generateJs(sourcePath, fileContent) {
  const generator = new SourceMapGenerator({ file: sourcePath });
  const tokenizer = acorn.tokenizer(fileContent, {
    ecmaVersion: 'latest',
    allowHashBang: true,
    locations: true,
  });

  for (const token of tokenizer) {
    const mapping = {
      original: token.loc.start,
      generated: token.loc.start,
      source: sourcePath,
    };
    if (token.type.label === 'name') {
      mapping.name = token.value;
    }
    generator.addMapping(mapping);
  }
  generator.setSourceContent(sourcePath, fileContent);

  return generator.toJSON();
}

const postcssSourceMapOptions = {
  inline: false,
  prev: false,
  sourcesContent: true,
  annotation: false,
};

function generateCss(sourcePath, fileContent) {
  const root = postcss.parse(fileContent, { from: sourcePath });
  const result = root.toResult({ to: sourcePath, map: postcssSourceMapOptions });

  return result.map.toJSON();
}

module.exports = {
  js: generateJs,
  css: generateCss,
};
