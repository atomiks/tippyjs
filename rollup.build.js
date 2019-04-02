/* eslint-disable no-console, @typescript-eslint/no-var-requires */
const fs = require('fs')
const pkg = require('./package.json')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const { terser } = require('rollup-plugin-terser')
const sass = require('rollup-plugin-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const resolve = require('rollup-plugin-node-resolve')
// const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const cssOnly = require('rollup-plugin-css-only')
const { green, blue } = require('colorette')

const BANNER = `/**!
* tippy.js v${pkg.version}
* (c) 2017-${new Date().getFullYear()} atomiks
* MIT License
*/`

const extensions = ['.js', '.ts']

const plugins = {
  babel: babel({
    exclude: 'node_modules/**',
    extensions,
  }),
  minify: terser(),
  resolve: resolve({ extensions }),
  css: cssOnly({ output: false }),
  json: json(),
}

const BASE_OUTPUT_CONFIG = {
  name: 'tippy',
  globals: { 'popper.js': 'Popper' },
  sourcemap: true,
}

const createPluginSCSS = output => {
  return sass({
    output,
    processor: css =>
      postcss([autoprefixer, cssnano])
        .process(css)
        .then(result => result.css),
  })
}

const createPreparedOutputConfig = format => (file, { min = false } = {}) => {
  const isCSS = ['css', 'themes'].includes(format)
  return {
    ...BASE_OUTPUT_CONFIG,
    format: isCSS ? 'umd' : format,
    sourcemap: !isCSS,
    file: format === 'css' ? 'index.js' : `./${format}/${file}`,
    banner: min ? undefined : BANNER,
  }
}

const BASE_PLUGINS = [plugins.babel, plugins.resolve, plugins.json]

const createRollupConfigWithoutPlugins = (
  input,
  { includePopper } = {},
) => plugins => ({
  input,
  plugins,
  external: includePopper ? ['popper.js'] : null,
})

const getCSSRollupConfig = createRollupConfigWithoutPlugins('./build/css.js', {
  includePopper: true
})

const getOutputConfigs = {
  bundle: {
    umd: createPreparedOutputConfig('umd'),
    esm: createPreparedOutputConfig('esm'),
  },
  css: createPreparedOutputConfig('css'),
  theme: createPreparedOutputConfig('themes'),
}

const build = async () => {
  console.log(blue('⏳ Building bundles...'))

  const preCSSBundle = await rollup(
    getCSSRollupConfig(createPluginSCSS('./index.css')),
  )
  await preCSSBundle.write(getOutputConfigs.css('./index.js'))
  fs.unlinkSync('./index.js')

  console.log('CSS done')

  const bundlePromises = []

  ;[
    ['index', {}],
    ['all', {css: true}]
  ].forEach(([indexOrAll, {css}]) => {
    const cssOrNot = css ? [plugins.css] : []
    const nonMinified = [...BASE_PLUGINS, ...cssOrNot]

    ;['', 'Minify'].forEach((minOrNot) => {
      const indexOrAllAndMinOrNot = indexOrAll + minOrNot
      const pluginConfigs = {
        [indexOrAll]: [...nonMinified],
        [indexOrAllAndMinOrNot]: [...nonMinified]
      }
      if (minOrNot) {
        // Put between base plugins and CSS
        pluginConfigs[indexOrAllAndMinOrNot].splice(1, 0, plugins.minify)
      }

      ['', 'WithPopper'].forEach((withPopperOrNot) => {
        const promise = rollup(
          createRollupConfigWithoutPlugins(
            `./build/${indexOrAll}.js`, {
              includePopper: !withPopperOrNot
            }
          )(
            pluginConfigs[indexOrAllAndMinOrNot]
          )
        ).then((resolvedBundle) => {
          // Standard UMD + ESM
          Object.entries(getOutputConfigs.bundle).forEach((
            [format, getOutputConfig]
          ) => {
            if (withPopperOrNot && format !== 'esm') {
              return
            }
            resolvedBundle.write(
              getOutputConfig(
                'index.' +
                  (withPopperOrNot ? 'popper.' : '') +
                  (indexOrAll === 'all' ? 'all.' : '') +
                  (minOrNot ? 'min.' : '') +
                  '.js',
                {min: Boolean(minOrNot)}
              )
            )
          })
        })
        // Save the promises for parallel loading
        bundlePromises.push(promise)
      })
    })
  })

  await Promise.all(bundlePromises)

  console.log(green('Bundles complete'))

  console.log(blue('\n⏳ Building CSS themes...'))

  for (const theme of fs.readdirSync('./build/themes')) {
    const preparedThemeConfig = createRollupConfigWithoutPlugins(
      `./build/themes/${theme}`,
    )
    const outputFile = `./themes/${theme.replace('.js', '.css')}`
    const bundle = await rollup(
      preparedThemeConfig(createPluginSCSS(outputFile)),
    )
    await bundle.write(getOutputConfigs.theme(theme))
    fs.unlinkSync(`./themes/${theme}`)
  }

  console.log(green('✓ Themes\n'))
}

build()
