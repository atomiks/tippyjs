# babel-preset-es2015-rollup changelog

## 3.0.0

* Remove `modify-babel-preset` and manually edit the preset, to reinstate npm 2 support

## 2.0.0

* Install `babel-plugin-transform-es2015-modules-commonjs` and `babel-plugin-external-helpers` so that `modify-babel-preset` can identify and remove them when npm 2 is involved

## 1.2.0

* Update modify-babel-preset to fix [#7](https://github.com/rollup/babel-preset-es2015-rollup/issues/7) ([#8](https://github.com/rollup/babel-preset-es2015-rollup/pull/8))

## 1.1.0

* Update to use renamed `external-helpers` plugin ([#3](https://github.com/rollup/babel-preset-es2015-rollup/pull/3))
* Use modify-babel-preset ([#4](https://github.com/rollup/babel-preset-es2015-rollup/pull/4))

## 1.0.0

* First release
