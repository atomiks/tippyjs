import base from './rollup.base.config'
import sass from 'rollup-plugin-sass'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

export default Object.assign(base, {
  entry: './themes.js',
  plugins: [
    sass({
      output: './dist/themes/themes.css',
      processor: css =>
        postcss([autoprefixer, cssnano])
          .process(css)
          .then(result => result.css)
    })
  ]
})
