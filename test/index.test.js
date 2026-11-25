'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { Readable, Writable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const File = require('vinyl');

const generate = require('../lib/generate');

const identityMap = require('../');

const jsContent = fs.readFileSync(path.join(__dirname, 'fixtures/helloworld.js'));
const jsHashBangContent = fs.readFileSync(path.join(__dirname, 'fixtures/helloworld.bin.js'));
const jsES2018Content = fs.readFileSync(path.join(__dirname, 'fixtures/es2018.js'));
const cssContent = fs.readFileSync(path.join(__dirname, 'fixtures/helloworld.css'));

function makeFile() {
  const file = new File({
    cwd: __dirname,
    base: path.join(__dirname, 'assets'),
    path: path.join(__dirname, 'assets', 'helloworld.js'),
    contents: jsContent,
  });

  file.sourceMap = {
    version: 3,
    file: 'helloworld.js',
    names: [],
    mappings: '',
    sources: ['helloworld.js'],
  };

  return file;
}

async function run(files) {
  const results = [];
  await pipeline(
    Readable.from(files),
    identityMap(),
    new Writable({
      objectMode: true,
      write(file, _, cb) {
        results.push(file);
        cb();
      },
    })
  );
  return results;
}

describe('identityMap', () => {

  it('ignores a file without sourceMap property', async (t) => {
    const file = makeFile();
    delete file.sourceMap;

    const spy = t.mock.method(generate, 'js');

    const files = await run([file]);
    assert.strictEqual(files.length, 1);
    assert.strictEqual(spy.mock.callCount(), 0);
  });

  it('only ignores a file without sourceMap property', async (t) => {
    const file = makeFile();
    delete file.sourceMap;
    const file2 = makeFile();

    const spy = t.mock.method(generate, 'js');

    const files = await run([file, file2]);
    assert.strictEqual(files.length, 2);
    assert.strictEqual(spy.mock.callCount(), 1);
  });

  it('ignores a non-Buffer file', async (t) => {
    const file = makeFile();
    file.contents = null;

    const spy = t.mock.method(generate, 'js');

    const files = await run([file]);
    assert.strictEqual(files.length, 1);
    assert.strictEqual(spy.mock.callCount(), 0);
  });

  it('only ignores a non-Buffer file', async (t) => {
    const file = makeFile();
    file.contents = null;
    const file2 = makeFile();

    const spy = t.mock.method(generate, 'js');

    const files = await run([file, file2]);
    assert.strictEqual(files.length, 2);
    assert.strictEqual(spy.mock.callCount(), 1);
  });

  it('adds a valid sourcemap for JS', async () => {
    const files = await run([makeFile()]);
    assert.strictEqual(files.length, 1);

    const sourcemap = files[0].sourceMap;
    assert.ok(sourcemap);
    assert.strictEqual(sourcemap.version, 3);
    assert.strictEqual(sourcemap.sources[0], 'helloworld.js');
    assert.strictEqual(sourcemap.sourcesContent[0], jsContent.toString());
    assert.deepStrictEqual(sourcemap.names, ['helloWorld', 'console', 'log']);
    assert.strictEqual(sourcemap.mappings, 'AAAA,YAAY;;AAEZ,SAASA,UAAU,CAAC,EAAE;CACrBC,OAAO,CAACC,GAAG,CAAC,cAAc,CAAC;AAC5B');
  });

  it('adds a valid sourcemap for JS with hashBang', async () => {
    const file = makeFile();
    file.contents = jsHashBangContent;

    const files = await run([file]);
    assert.strictEqual(files.length, 1);

    const sourcemap = files[0].sourceMap;
    assert.ok(sourcemap);
    assert.strictEqual(sourcemap.version, 3);
    assert.strictEqual(sourcemap.sources[0], 'helloworld.js');
    assert.strictEqual(sourcemap.sourcesContent[0], jsHashBangContent.toString());
    assert.deepStrictEqual(sourcemap.names, ['helloWorld', 'console', 'log']);
    assert.strictEqual(sourcemap.mappings, ';AACA,YAAY;;AAEZ,SAASA,UAAU,CAAC,EAAE;EACpBC,OAAO,CAACC,GAAG,CAAC,cAAc,CAAC;AAC7B');
  });

  it('adds a valid sourcemap for JS with ES2018 syntax', async () => {
    const file = makeFile();
    file.contents = jsES2018Content;

    const files = await run([file]);
    assert.strictEqual(files.length, 1);

    const sourcemap = files[0].sourceMap;
    assert.ok(sourcemap);
    assert.strictEqual(sourcemap.version, 3);
    assert.strictEqual(sourcemap.sources[0], 'helloworld.js');
    assert.strictEqual(sourcemap.sourcesContent[0], jsES2018Content.toString());
    assert.deepStrictEqual(sourcemap.names, ['justA', 'a', 'AandB', 'b', '_', 'justB', 'Boolean', 'exec', 'Promise', 'resolve', 'String', 'raw']);
    assert.strictEqual(sourcemap.mappings, 'AAAA,MAAMA,MAAM,EAAE,EAAEC,CAAC,EAAE,EAAE,CAAC;;AAEtB,MAAMC,MAAM,EAAE,EAAE,GAAGF,KAAK,EAAEG,CAAC,EAAE,EAAE,CAAC;;AAEhC,MAAM,EAAEF,CAAC,EAAEG,CAAC,EAAE,GAAGC,MAAM,EAAE,EAAEH,KAAK;;;AAGhCI,OAAO,CAAC,MAAM,CAACC,IAAI,CAAC,KAAK,CAAC,CAAC;;;AAG3BC,OAAO,CAACC,OAAO,CAAC,CAAC,CAAC,OAAO,CAAC,CAAC,EAAE,GAAG;;AAEhC,CAAC,CAAC;;;AAGFH,OAAO,CAAC,OAAO,CAACC,IAAI,CAAC,MAAM,CAAC,CAAC;;;AAG7BD,OAAO,CAAC,YAAY,CAACC,IAAI,CAAC,KAAK,CAAC,CAAC;;;AAGjCG,MAAM,CAACC,GAAG,CAAC,QAAQ,CAAC;;;AAGpB,iCAAiC,CAACJ,IAAI,CAAC,WAAW,CAAC');
  });

  it('adds a valid source map for CSS', async () => {
    const file = makeFile();
    file.extname = '.css';
    file.contents = cssContent;

    const files = await run([file]);
    assert.strictEqual(files.length, 1);

    const sourcemap = files[0].sourceMap;
    assert.ok(sourcemap);
    assert.strictEqual(sourcemap.version, 3);
    assert.strictEqual(sourcemap.sources[0], 'helloworld.css');
    assert.strictEqual(sourcemap.sourcesContent[0], cssContent.toString());
    assert.deepStrictEqual(sourcemap.names, []);
    assert.strictEqual(sourcemap.mappings, 'AAAA;CACC,gBAAgB;CAChB,WAAW;AACZ');
  });
});
