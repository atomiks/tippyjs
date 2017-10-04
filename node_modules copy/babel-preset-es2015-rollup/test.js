var transform = require('babel-core').transform;
var strictEqual = require('assert').strictEqual;
var babelPresetEs2015Rollup = require('./');

describe('babel-preset-es2015-rollup', function() {
  it('transforms ES2015 features that are not modules', function() {
    strictEqual(
      transform('() => {};', { presets: [babelPresetEs2015Rollup] }).code,
      '(function () {});'
    );
  });

  it('does not transform imports or exports', function() {
    strictEqual(
      transform('import "foo";\nexport default 0;', { presets: [babelPresetEs2015Rollup] }).code,
      'import "foo";\nexport default 0;'
    );
  });

  it('uses external helpers', function() {
    strictEqual(
      transform('typeof a;', { presets: [babelPresetEs2015Rollup] }).code,
      'typeof a === "undefined" ? "undefined" : babelHelpers.typeof(a);'
    );
  });
});
