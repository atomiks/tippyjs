import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import cssOnly from 'rollup-plugin-css-only'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const NAMESPACE_PREFIX = process.env.NAMESPACE || 'tippy'

const PLUGINS = {
  babel: babel({ extensions: ['.js', '.ts'] }),
  replaceNamespace: replace({
    __NAMESPACE_PREFIX__: NAMESPACE_PREFIX,
  }),
  replaceEnvProduction: replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  replaceEnvDevelopment: replace({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  minify: terser(),
  resolve: resolve({ extensions: ['.js', '.ts'] }),
  css: cssOnly({ output: false }),
  json: json(),
}

const COMMON_PLUGINS = [PLUGINS.replaceNamespace, PLUGINS.resolve, PLUGINS.json]

const PLUGIN_CONFIGS = {
  base: [PLUGINS.babel, ...COMMON_PLUGINS],
  baseMin: [
    PLUGINS.babel,
    PLUGINS.replaceEnvProduction,
    ...COMMON_PLUGINS,
    PLUGINS.minify,
  ],
  bundle: [PLUGINS.babel, ...COMMON_PLUGINS, PLUGINS.css],
  bundleMin: [
    PLUGINS.babel,
    PLUGINS.replaceEnvProduction,
    ...COMMON_PLUGINS,
    PLUGINS.minify,
    PLUGINS.css,
  ],
  iifeBase: [PLUGINS.babel, PLUGINS.replaceEnvDevelopment, ...COMMON_PLUGINS],
  iifeBaseMin: [
    PLUGINS.babel,
    PLUGINS.replaceEnvProduction,
    ...COMMON_PLUGINS,
    PLUGINS.minify,
  ],
  iifeBundle: [
    PLUGINS.babel,
    PLUGINS.replaceEnvDevelopment,
    ...COMMON_PLUGINS,
    PLUGINS.css,
  ],
  iifeBundleMin: [
    PLUGINS.babel,
    PLUGINS.replaceEnvProduction,
    ...COMMON_PLUGINS,
    PLUGINS.minify,
    PLUGINS.css,
  ],
}

const BANNER = `/**!
* tippy.js v${pkg.version}
* (c) 2017-${new Date().getFullYear()} atomiks
* MIT License
*/`

const commonIIFEOutputOptions = {
  globals: { 'popper.js': 'Popper' },
  format: 'iife',
  name: 'tippy',
  esModule: false,
  sourcemap: true,
}

export default [
  {
    input: 'build/base.js',
    plugins: PLUGIN_CONFIGS.iifeBase,
    external: ['popper.js'],
    output: {
      ...commonIIFEOutputOptions,
      file: 'iife/tippy.js',
      banner: BANNER,
    },
  },
  {
    input: 'build/bundle.js',
    plugins: PLUGIN_CONFIGS.iifeBundle,
    external: ['popper.js'],
    output: {
      ...commonIIFEOutputOptions,
      file: 'iife/tippy.bundle.js',
      banner: BANNER,
    },
  },
  {
    input: 'build/base.js',
    plugins: PLUGIN_CONFIGS.iifeBaseMin,
    external: ['popper.js'],
    output: {
      ...commonIIFEOutputOptions,
      file: 'iife/tippy.min.js',
    },
  },
  {
    input: 'build/bundle.js',
    plugins: PLUGIN_CONFIGS.iifeBundleMin,
    external: ['popper.js'],
    output: {
      ...commonIIFEOutputOptions,
      file: 'iife/tippy.bundle.min.js',
    },
  },
  {
    input: 'build/addons.js',
    plugins: PLUGIN_CONFIGS.iifeBase,
    external: ['popper.js', '..'],
    output: {
      ...commonIIFEOutputOptions,
      name: '__tippyAddons__',
      globals: { ...commonIIFEOutputOptions.globals, '..': 'tippy' },
      file: 'iife/tippy-addons.js',
    },
  },
  {
    input: 'build/addons.js',
    plugins: PLUGIN_CONFIGS.iifeBaseMin,
    external: ['popper.js', '..'],
    output: {
      ...commonIIFEOutputOptions,
      name: '__tippyAddons__',
      globals: { ...commonIIFEOutputOptions.globals, '..': 'tippy' },
      file: 'iife/tippy-addons.min.js',
    },
  },
  {
    input: {
      tippy: 'build/base.js',
      'tippy.bundle': 'build/bundle.js',
      'tippy-addons': 'build/addons-pure.js',
    },
    plugins: PLUGIN_CONFIGS.bundle,
    external: ['popper.js'],
    output: [
      {
        dir: 'esm',
        format: 'esm',
        banner: BANNER,
        sourcemap: true,
      },
      {
        dir: 'cjs',
        format: 'cjs',
        banner: BANNER,
        sourcemap: true,
      },
    ],
  },
  {
    input: {
      'tippy.min': 'build/base.js',
      'tippy.bundle.min': 'build/bundle.js',
      'tippy-addons.min': 'build/addons-pure.js',
    },
    plugins: PLUGIN_CONFIGS.bundleMin,
    external: ['popper.js'],
    output: [
      {
        dir: 'esm',
        format: 'esm',
        banner: BANNER,
        sourcemap: true,
      },
      {
        dir: 'cjs',
        format: 'cjs',
        banner: BANNER,
        sourcemap: true,
      },
    ],
  },
]
