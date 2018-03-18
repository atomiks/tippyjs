import babel from 'rollup-plugin-babel'
import sass from 'rollup-plugin-sass'
import serve from 'rollup-plugin-serve'
import css from 'rollup-plugin-css-only'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import livereload from 'rollup-plugin-livereload'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default {
  input: './build/bundle.js',
  output: {
    file: './docs/tippy/tippy.js',
    name: 'tippy',
    format: 'umd'
  },
  plugins: [
    json(),
    sass({
      output: './docs//tippy/tippy.css',
      processor: css =>
        postcss([autoprefixer, cssnano])
          .process(css)
          .then(result => result.css)
    }),
    babel({
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread', 'transform-object-assign']
    }),
    commonjs({ namedExports: { 'node_modules/popper.js/dist/popper.js': ['Popper'] } }),
    resolve({ browser: true }),
    serve('docs'),
    livereload()
  ]
}
