import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import sass from 'rollup-plugin-sass'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default Object.assign(base, {
    dest: './docs/tippy/tippy.js',
    external: [ 'Popper' ],
    plugins: [
        sass({
            output: true
        }),
        babel({
            presets: ['es2015-rollup'],
            plugins: ['transform-object-rest-spread', 'transform-object-assign'],
            exclude: 'node_modules/**',
        }),
        commonjs({
          namedExports: {
            'node_modules/popper.js/dist/popper.js': [ 'Popper' ]
          }
        }),
        resolve({
              browser: true
        }),
        serve('docs'),
        livereload()
    ]
})
