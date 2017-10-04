import base from './rollup.base.config'
import babel from 'rollup-plugin-babel'
import sass from 'rollup-plugin-sass'
import babili from 'rollup-plugin-babili'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

export default Object.assign(base, {
    dest: './dist/tippy.standalone.js',
    external: ['popper.js'],
    plugins: [
        sass({
            output: './dist/tippy.css',
            processor: css => postcss([autoprefixer, cssnano])
            .process(css)
            .then(result => result.css)
        }),
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
