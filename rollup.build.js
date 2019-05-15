/* eslint-disable @typescript-eslint/no-var-requires */
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

const FILENAMES = {
  base: 'tippy.js',
  baseMin: 'tippy.min.js',
  bundle: 'tippy.bundle.js',
  bundleMin: 'tippy.bundle.min.js',
}

const BASE_OUTPUT_CONFIG = {
  name: 'tippy',
  globals: { 'popper.js': 'Popper' },
  sourcemap: true,
}

const PLUGINS = {
  babel: babel({
    exclude: 'node_modules/**',
    extensions,
  }),
  replaceNamespace: replace({
    __NAMESPACE_PREFIX__: NAMESPACE_PREFIX,
  }),
  replaceEnv: replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  replaceEnvUMD: replace({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  minify: terser(),
  resolve: resolve({ extensions }),
  css: cssOnly({ output: false }),
  json: json(),
}

const COMMON_PLUGINS = [PLUGINS.replaceNamespace, PLUGINS.resolve, PLUGINS.json]

const PLUGIN_CONFIGS = {
  base: [PLUGINS.babel, ...COMMON_PLUGINS],
  baseMin: [
    PLUGINS.babel,
    PLUGINS.replaceEnv,
    ...COMMON_PLUGINS,
    PLUGINS.minify,
  ],
  bundle: [PLUGINS.babel, ...COMMON_PLUGINS, PLUGINS.css],
  bundleMin: [
    PLUGINS.babel,
    PLUGINS.replaceEnv,
    ...COMMON_PLUGINS,
    PLUGINS.minify,
    PLUGINS.css,
  ],
  umdBase: [PLUGINS.babel, PLUGINS.replaceEnvUMD, ...COMMON_PLUGINS],
  umdBundle: [
    PLUGINS.babel,
    PLUGINS.replaceEnvUMD,
    ...COMMON_PLUGINS,
    PLUGINS.css,
  ],
}

function createPluginSCSS(output) {
  return sass({
    output,
    options: {
      data: `$namespace-prefix: ${NAMESPACE_PREFIX};`,
    },
    processor(css) {
      return postcss([autoprefixer, cssnano])
        .process(css, { from: undefined })
        .then(result => result.css)
    },
  })
}

function createRollupConfig(inputFile, plugins) {
  return {
    input: `./build/${inputFile}.js`,
    external: ['popper.js'],
    plugins,
  }
}

async function build() {
  console.log(blue('⏳ Building bundles...'))

  // Create `./index.css` first
  const cssConfig = createRollupConfig(
    'css',
    PLUGIN_CONFIGS.bundle.concat(createPluginSCSS('./index.css')),
  )
  const cssBundle = await rollup(cssConfig)
  await cssBundle.write({
    ...BASE_OUTPUT_CONFIG,
    sourcemap: false,
    format: 'umd',
    file: './index.js',
  })
  fs.unlinkSync('./index.js')

  const cjs = {
    format: 'cjs',
    configs: {
      base: await rollup(createRollupConfig('base', PLUGIN_CONFIGS.base)),
      bundle: await rollup(createRollupConfig('bundle', PLUGIN_CONFIGS.bundle)),
    },
  }

  const esm = {
    format: 'esm',
    configs: {
      base: await rollup(createRollupConfig('base', PLUGIN_CONFIGS.base)),
      baseMin: await rollup(createRollupConfig('base', PLUGIN_CONFIGS.baseMin)),
      bundle: await rollup(createRollupConfig('bundle', PLUGIN_CONFIGS.bundle)),
      bundleMin: await rollup(
        createRollupConfig('bundle', PLUGIN_CONFIGS.bundleMin),
      ),
    },
  }

  const umd = {
    format: 'umd',
    configs: {
      base: await rollup(createRollupConfig('base', PLUGIN_CONFIGS.umdBase)),
      baseMin: await rollup(createRollupConfig('base', PLUGIN_CONFIGS.baseMin)),
      bundle: await rollup(
        createRollupConfig('bundle', PLUGIN_CONFIGS.umdBundle),
      ),
      bundleMin: await rollup(
        createRollupConfig('bundle', PLUGIN_CONFIGS.bundleMin),
      ),
    },
  }

  const formats = [cjs, esm, umd]

  formats.forEach(formatObject => {
    const { format } = formatObject

    Object.entries(formatObject.configs).forEach(([type, bundle]) => {
      bundle.write({
        ...BASE_OUTPUT_CONFIG,
        format,
        file: `./${format}/${FILENAMES[type]}`,
        banner: type.includes('Min') ? undefined : BANNER,
      })
    })
  })

  console.log(green('Bundles complete'))

  console.log(blue('\n⏳ Building CSS themes...'))

  for (const theme of fs.readdirSync('./build/themes')) {
    const filenameWithoutJSExtension = theme.replace('.js', '')
    const filenameWithCSSExtension = theme.replace('.js', '.css')
    const outputFile = `./themes/${filenameWithCSSExtension}`

    const config = createRollupConfig(
      `themes/${filenameWithoutJSExtension}`,
      PLUGIN_CONFIGS.bundle.concat(createPluginSCSS(outputFile)),
    )
    const bundle = await rollup(config)
    await bundle.write({
      ...BASE_OUTPUT_CONFIG,
      format: 'umd',
      sourcemap: false,
      file: outputFile,
    })
  }

  console.log(green('✓ Themes\n'))
}

build()
