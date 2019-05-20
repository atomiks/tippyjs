/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const pkg = require('./package.json')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const sass = require('rollup-plugin-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const resolve = require('rollup-plugin-node-resolve')
const json = require('rollup-plugin-json')
const cssOnly = require('rollup-plugin-css-only')
const replace = require('rollup-plugin-replace')
const { green, blue } = require('colorette')

const NAMESPACE_PREFIX = process.env.NAMESPACE || 'tippy'

const BASE_OUTPUT_CONFIG = {
  name: 'tippy',
  globals: { 'popper.js': 'Popper' },
  sourcemap: true,
}

const PLUGINS = {
  babel: babel({
    exclude: 'node_modules/**',
    extensions: ['.js', '.ts'],
  }),
  replaceNamespace: replace({
    __NAMESPACE_PREFIX__: NAMESPACE_PREFIX,
  }),
  resolve: resolve({ extensions: ['.js', '.ts'] }),
  css: cssOnly({ output: false }),
  json: json(),
}

const PLUGIN_CONFIG = [
  PLUGINS.babel,
  PLUGINS.replaceNamespace,
  PLUGINS.resolve,
  PLUGINS.json,
  PLUGINS.css,
]

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
  // Create `index.d.ts` file from `src/types.ts`
  fs.copyFileSync('./src/types.ts', './index.d.ts')

  // Create `./index.css` first
  const cssConfig = createRollupConfig(
    'css',
    PLUGIN_CONFIG.concat(createPluginSCSS('./index.css')),
  )
  const cssBundle = await rollup(cssConfig)
  await cssBundle.write({
    ...BASE_OUTPUT_CONFIG,
    sourcemap: false,
    format: 'umd',
    file: './index.js',
  })
  fs.unlinkSync('./index.js')

  for (const folder of ['themes', 'animations']) {
    for (const file of fs.readdirSync(`./build/${folder}`)) {
      const filenameWithoutJSExtension = file.replace('.js', '')
      const filenameWithCSSExtension = file.replace('.js', '.css')
      const outputFile = `./${folder}/${filenameWithCSSExtension}`

      const config = createRollupConfig(
        `${folder}/${filenameWithoutJSExtension}`,
        PLUGIN_CONFIG.concat(createPluginSCSS(outputFile)),
      )
      const bundle = await rollup(config)
      await bundle.write({
        ...BASE_OUTPUT_CONFIG,
        format: 'umd',
        sourcemap: false,
        file: 'index.js',
      })
    }
  }

  fs.unlinkSync('./index.js')
}

build()
