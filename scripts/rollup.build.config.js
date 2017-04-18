import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import es2015 from 'babel-preset-es2015-rollup'
import sass from 'rollup-plugin-sass'
import uglify from 'rollup-plugin-uglify'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { minify } from 'uglify-js-harmony';

export default Object.assign(base, {
    dest: './dist/tippy.standalone.js',
    plugins: [
        sass({
            output: './dist/tippy.css',
            processor: css => postcss([autoprefixer, cssnano])
            .process(css)
            .then(result => result.css)
        }),
        babel({
            presets: [
                [es2015]
            ],
            plugins: ['transform-object-rest-spread'],
            exclude: 'node_modules/**',
        }),
        uglify({}, minify)
    ]
})
