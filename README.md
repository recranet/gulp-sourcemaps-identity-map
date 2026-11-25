# @recranet/gulp-sourcemaps-identity-map

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][ci-image]][ci-url]

Gulp plugin for generating an identity sourcemap for a file.

Modernized fork of [`@gulp-sourcemaps/identity-map`](https://github.com/gulp-sourcemaps/identity-map). The public API is unchanged.

## Requirements

* Node.js 22.12 or newer.

## Example

```js
var identityMap = require('@recranet/gulp-sourcemaps-identity-map');

gulp.src(...)
  .pipe(sourcemaps.init())
  .pipe(identityMap()) // .js and .css files will get a generated sourcemap
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(...))
```

## API

### `identityMap()`

Returns an `objectMode` Transform stream that processes each file with a `.sourceMap` property and buffered contents. A sourcemap is generated and attached for each `.js` and `.css` file.

## License

MIT

[downloads-image]: https://img.shields.io/npm/dm/@recranet/gulp-sourcemaps-identity-map.svg
[npm-url]: https://www.npmjs.com/package/@recranet/gulp-sourcemaps-identity-map
[npm-image]: https://img.shields.io/npm/v/@recranet/gulp-sourcemaps-identity-map.svg

[ci-url]: https://github.com/recranet/gulp-sourcemaps-identity-map/actions/workflows/ci.yml
[ci-image]: https://img.shields.io/github/actions/workflow/status/recranet/gulp-sourcemaps-identity-map/ci.yml?style=flat-square
