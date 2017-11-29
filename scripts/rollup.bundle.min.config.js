import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import babili from 'rollup-plugin-babili'
import sass from 'rollup-plugin-sass'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default Object.assign(base, {
  entry: './bundle.js',
  dest: './dist/tippy.min.js',
  plugins: [
    sass({
      output: './dist/tippy.css',
      processor: css => postcss([autoprefixer, cssnano])
      .process(css)
      .then(result => result.css)
    }),
    babel({
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread', 'transform-object-assign']
    }),
    babili({
      comments: false
    }),
    commonjs({
      namedExports: {
        'node_modules/popper.js/dist/popper.js': ['Popper']
      }
    }),
    resolve({
      browser: true
    })
  ]
})
