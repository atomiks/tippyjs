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
const replace = require('rollup-plugin-replace')
const { green, blue } = require('colorette')

const BANNER = `/**!
* tippy.js v${pkg.version}
* (c) 2017-${new Date().getFullYear()} atomiks
* MIT License
*/`

const NAMESPACE_PREFIX = process.env.NAMESPACE || 'tippy'

const extensions = ['.js', '.ts']

const plugins = {
  babel: babel({
    exclude: 'node_modules/**',
    extensions,
  }),
  replace: replace({
    __NAMESPACE_PREFIX__: NAMESPACE_PREFIX,
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
const BASE_PLUGINS = [plugins.replace, plugins.resolve, plugins.json]

const pluginConfigs = {
  index: [plugins.babel, ...BASE_PLUGINS],
  indexMinify: [plugins.babel, ...BASE_PLUGINS, plugins.minify],
  all: [plugins.babel, ...BASE_PLUGINS, plugins.css],
  allMinify: [plugins.babel, ...BASE_PLUGINS, plugins.minify, plugins.css],
}

const createPluginSCSS = output => {
  return sass({
    output,
    options: {
      data: `$namespace-prefix: ${NAMESPACE_PREFIX};`,
    },
    processor: css =>
      postcss([autoprefixer, cssnano])
        .process(css, { from: undefined })
        .then(result => result.css),
  })
}

const createRollupConfigWithoutPlugins = input => plugins => ({
  input,
  plugins,
  external: ['popper.js'],
})

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

const getRollupConfigs = {
  css: createRollupConfigWithoutPlugins('./build/css.js'),
  index: createRollupConfigWithoutPlugins('./build/index.js'),
  all: createRollupConfigWithoutPlugins('./build/all.js'),
}

const getOutputConfigs = {
  bundle: [
    createPreparedOutputConfig('umd'),
    createPreparedOutputConfig('esm'),
  ],
  css: createPreparedOutputConfig('css'),
  theme: createPreparedOutputConfig('themes'),
}

const build = async () => {
  console.log(blue('⏳ Building bundles...'))

  const preCSSBundle = await rollup(
    getRollupConfigs.css(createPluginSCSS('./index.css')),
  )
  await preCSSBundle.write(getOutputConfigs.css('./index.js'))
  fs.unlinkSync('./index.js')

  console.log('CSS done')

  const bundles = {
    index: await rollup(getRollupConfigs.index(pluginConfigs.index)),
    indexMin: await rollup(getRollupConfigs.index(pluginConfigs.indexMinify)),
    all: await rollup(getRollupConfigs.all(pluginConfigs.all)),
    allMin: await rollup(getRollupConfigs.all(pluginConfigs.allMinify)),
  }

  // Standard UMD + ESM
  for (const getOutputConfig of getOutputConfigs.bundle) {
    const outputConfigs = {
      index: getOutputConfig('index.js'),
      indexMin: getOutputConfig('index.min.js', { min: true }),
      all: getOutputConfig('index.all.js'),
      allMin: getOutputConfig('index.all.min.js', { min: true }),
    }

    bundles.index.write(outputConfigs.index)
    bundles.indexMin.write(outputConfigs.indexMin)
    bundles.all.write(outputConfigs.all)
    bundles.allMin.write(outputConfigs.allMin)
  }

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
