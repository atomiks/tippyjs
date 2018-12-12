const fs = require('fs')
const pkg = require('./package.json')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const minify = require('rollup-plugin-babel-minify')
const sass = require('rollup-plugin-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const cssOnly = require('rollup-plugin-css-only')
const json = require('rollup-plugin-json')
const { magenta, red, green, blue, bold, yellow } = require('colorette')

// wrapper utils
const sassPluginOutput = name =>
  sass({
    output: name,
    processor: css =>
      postcss([autoprefixer, cssnano])
        .process(css)
        .then(result => result.css)
  })
const r = (entryFile, plugins = [], excludePopper) =>
  rollup({
    input: `./build/${entryFile}`,
    plugins:
      typeof plugins === 'string'
        ? [sassPluginOutput(plugins), cssOnly({ output: plugins })]
        : [
            pluginJSON,
            pluginSCSS,
            pluginCSS,
            ...plugins,
            pluginCJS,
            pluginResolve
          ],
    external: excludePopper ? ['popper.js'] : []
  })
const output = type => (fileName, { min, sourcemap = true } = {}) => ({
  name: 'tippy',
  format: type,
  file: `./dist/${type === 'es' ? 'esm/' : ''}${fileName}`,
  globals: { 'popper.js': 'Popper' },
  sourcemap,
  banner: min
    ? false
    : `/*!
* Tippy.js v${pkg.version}
* (c) 2017-${new Date().getFullYear()} atomiks
* MIT
*/`
})

// plugins
const pluginES5 = babel({
  presets: [['env', { modules: false }], 'stage-2'],
  plugins: ['external-helpers']
})
const pluginMinify = minify({ comments: false })
const pluginJSON = json()
const pluginSCSS = sassPluginOutput('./dist/tippy.css')
const pluginCSS = cssOnly({ output: false })
const pluginCJS = commonjs()
const pluginResolve = resolve({ browser: true })

const umd = output('umd')
const esm = output('es')

const build = async () => {
  console.log(blue('⏳ Building UMD and ESM bundles...'))

  // Tippy + Popper
  const bundle = await r('bundle.js', [pluginES5])
  // "all" is reliant on the existence of compiled css
  await bundle.write(umd('tippy.js'))
  const bundleMin = await r('bundle.js', [pluginES5, pluginMinify])

  // Tippy
  const standalone = await r('bundle.js', [pluginES5], true)
  const standaloneMin = await r('bundle.js', [pluginES5, pluginMinify], true)

  // Tippy + Popper + CSS
  const all = await r('main.js', [pluginES5])
  const allMin = await r('main.js', [pluginES5, pluginMinify])

  all.write(umd('tippy.all.js'))
  allMin.write(umd('tippy.all.min.js', { min: true }))
  console.log(green('✓ All'))

  bundle.write(esm('tippy.js'))
  bundleMin.write(umd('tippy.min.js', { min: true }))
  bundleMin.write(esm('tippy.min.js', { min: true }))
  console.log(green('✓ Bundle'))

  standalone.write(umd('tippy.standalone.js'))
  standalone.write(esm('tippy.standalone.js'))
  standaloneMin.write(umd('tippy.standalone.min.js', { min: true }))
  standaloneMin.write(esm('tippy.standalone.min.js', { min: true }))
  console.log(green('✓ Standalone'))

  console.log(blue('\n⏳ Building CSS themes...'))
  for (let theme of fs.readdirSync('./src/scss/themes')) {
    theme = theme.replace('.scss', '')
    const t = await r(`themes/${theme}.js`, `./dist/themes/${theme}.css`)
    await t.write(umd(`tippy.${theme}.js`, { sourcemap: false }))
    fs.unlinkSync(`./dist/tippy.${theme}.js`)
  }
  console.log(green('✓ Themes\n'))
}

build()
