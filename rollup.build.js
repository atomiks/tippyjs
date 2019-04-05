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
const BASE_PLUGINS = [plugins.resolve, plugins.json]

const pluginConfigs = {
  index: [plugins.babel, ...BASE_PLUGINS],
  indexMinify: [plugins.babel, ...BASE_PLUGINS, plugins.minify],
  all: [plugins.babel, ...BASE_PLUGINS, plugins.css],
  allMinify: [plugins.babel, ...BASE_PLUGINS, plugins.minify, plugins.css],
}

const createPluginSCSS = output => {
  return sass({
    output,
    processor: css =>
      postcss([autoprefixer, cssnano])
        .process(css, { from: undefined })
        .then(result => result.css),
  })
}

const createRollupConfigWithoutPlugins = (
  input,
  { includeExternal } = {},
) => plugins => ({
  input,
  plugins,
  external: includeExternal ? ['popper.js'] : null,
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
  css: createRollupConfigWithoutPlugins('./build/css.js', {
    includeExternal: true,
  }),
  index: createRollupConfigWithoutPlugins('./build/index.js', {
    includeExternal: true,
  }),
  all: createRollupConfigWithoutPlugins('./build/all.js', {
    includeExternal: true,
  }),
  indexWithPopper: createRollupConfigWithoutPlugins('./build/index.js'),
  allWithPopper: createRollupConfigWithoutPlugins('./build/all.js'),
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

  const bundles = {}
  await Promise.all(
    Object.entries({
      index: rollup(getRollupConfigs.index(pluginConfigs.index)),
      indexWithPopper: rollup(
        getRollupConfigs.indexWithPopper(pluginConfigs.index),
      ),
      indexMin: rollup(getRollupConfigs.index(pluginConfigs.indexMinify)),
      indexWithPopperMin: rollup(
        getRollupConfigs.indexWithPopper(pluginConfigs.indexMinify),
      ),
      all: rollup(getRollupConfigs.all(pluginConfigs.all)),
      allWithPopper: rollup(getRollupConfigs.allWithPopper(pluginConfigs.all)),
      allMin: rollup(getRollupConfigs.all(pluginConfigs.allMinify)),
      allWithPopperMin: rollup(
        getRollupConfigs.allWithPopper(pluginConfigs.allMinify),
      ),
    }).map(async ([key, bundlePromise]) => {
      bundles[key] = await bundlePromise
    }),
  )

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

    if (outputConfigs.index.format !== 'esm') {
      continue
    }

    const withPopperOutputConfigs = {
      indexWithPopper: getOutputConfig('index.popper.js'),
      indexWithPopperMin: getOutputConfig('index.popper.min.js', { min: true }),
      allWithPopper: getOutputConfig('index.popper.all.js'),
      allWithPopperMin: getOutputConfig('index.popper.all.min.js', {
        min: true,
      }),
    }

    bundles.indexWithPopper.write(withPopperOutputConfigs.indexWithPopper)
    bundles.indexWithPopperMin.write(withPopperOutputConfigs.indexWithPopperMin)
    bundles.allWithPopper.write(withPopperOutputConfigs.allWithPopper)
    bundles.allWithPopperMin.write(withPopperOutputConfigs.allWithPopperMin)
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
