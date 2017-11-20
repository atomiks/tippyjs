import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import sass from 'rollup-plugin-sass'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default Object.assign(base, {
  entry: './src/js/misc/themes.js',
  dest: './dist/themes/themes.js',
  plugins: [
    sass({
      output: './dist/themes/themes.css',
      processor: css => postcss([autoprefixer, cssnano])
      .process(css)
      .then(result => result.css)
    })
  ]
})
