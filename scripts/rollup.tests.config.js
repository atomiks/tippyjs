import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: './tests/spec/functional.js',
  dest: './dist/tests/functional.js',
  external: ['Popper'],
  plugins: [
    babel({
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread', 'transform-object-assign'],
      exclude: 'node_modules/**',
    }),
    commonjs({
      namedExports: {
        'node_modules/popper.js/dist/popper.js': ['Popper']
      }
    }),
    resolve({
      browser: true
    }),
  ]
}
