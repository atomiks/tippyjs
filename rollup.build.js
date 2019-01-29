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
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const cssOnly = require('rollup-plugin-css-only')
const { green, blue } = require('colorette')

const BANNER = `/**!
* tippy.js v${pkg.version}
* (c) 2017-${new Date().getFullYear()} atomiks
* MIT License
*/
`

const pluginBabel = babel({ exclude: 'node_modules/**' })
const pluginMinify = terser()
const pluginResolve = resolve()
const pluginCSS = cssOnly({ output: false })
const pluginJSON = json()
const createPluginSCSS = output =>
  sass({
    output,
    processor: css =>
      postcss([autoprefixer, cssnano])
        .process(css)
        .then(result => result.css),
  })

const config = input => (...plugins) => ({
  input,
  plugins: [pluginBabel, pluginResolve, pluginJSON, ...plugins],
  external: ['popper.js'],
})

const output = format => (file, { min = false } = {}) => {
  const isCSS = ['css', 'themes'].includes(format)
  return {
    name: 'tippy',
    format: isCSS ? 'umd' : format,
    sourcemap: !isCSS,
    file: format === 'css' ? 'index.js' : `./${format}/${file}`,
    globals: { 'popper.js': 'Popper' },
    banner: min ? undefined : BANNER,
  }
}

const bundleFormats = [output('umd'), output('es')]
const cssFormat = output('css')
const themesFormat = output('themes')

const build = async () => {
  console.log(blue('⏳ Building bundles...'))

  const indexConfig = config('./build/index.js')
  const allConfig = config('./build/all.js')

  const preCSSBundle = await rollup(
    config('./build/css.js')(createPluginSCSS('./index.css')),
  )
  await preCSSBundle.write(cssFormat('./index.js'))
  fs.unlinkSync('./index.js')

  const bundle = await rollup(indexConfig())
  const bundleMin = await rollup(indexConfig(pluginMinify))
  const bundleCSS = await rollup(allConfig(pluginCSS))
  const bundleCSSMin = await rollup(allConfig(pluginMinify, pluginCSS))

  for (const format of bundleFormats) {
    bundle.write(format('index.js'))
    bundleMin.write(format('index.min.js', { min: true }))
    bundleCSS.write(format('index.all.js'))
    bundleCSSMin.write(format('index.all.min.js', { min: true }))
  }

  console.log(green('Bundles complete'))

  console.log(blue('\n⏳ Building CSS themes...'))

  for (const theme of fs.readdirSync('./build/themes')) {
    const themeConfig = config(`./build/themes/${theme}`)
    const outputFile = `./themes/${theme.replace('.js', '')}.css`
    const bundle = await rollup(themeConfig(createPluginSCSS(outputFile)))
    await bundle.write(themesFormat(theme))
    fs.unlinkSync(`./themes/${theme}`)
  }

  console.log(green('✓ Themes\n'))
}

build()
