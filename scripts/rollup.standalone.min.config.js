import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import sass from 'rollup-plugin-sass'
import babili from 'rollup-plugin-babili'
import postcss from 'postcss'
import css from 'rollup-plugin-css-only'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

export default Object.assign(base, {
  entry: './bundle.js',
  dest: './dist/tippy.standalone.min.js',
  external: ['popper.js'],
  plugins: [
    sass({
      output: './dist/tippy.css',
      processor: css => postcss([autoprefixer, cssnano])
      .process(css)
      .then(result => result.css)
    }),
    css({ output: false }),
    babel({
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread', 'transform-object-assign'],
      exclude: 'node_modules/**',
    }),
    babili({
      comments: false
    })
  ]
})
