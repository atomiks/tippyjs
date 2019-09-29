import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import cssOnly from 'rollup-plugin-css-only';
import replace from 'rollup-plugin-replace';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

const NAMESPACE_PREFIX = process.env.NAMESPACE || 'tippy';

const PLUGINS = {
  babel: babel({extensions: ['.js', '.ts']}),
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
  resolve: resolve({extensions: ['.js', '.ts']}),
  css: cssOnly({output: false}),
  json: json(),
};

const COMMON_PLUGINS = [
  PLUGINS.replaceNamespace,
  PLUGINS.resolve,
  PLUGINS.json,
];

const PLUGIN_CONFIGS = {
  base: [PLUGINS.babel, ...COMMON_PLUGINS],
  bundle: [PLUGINS.babel, ...COMMON_PLUGINS, PLUGINS.css],
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
};

const BANNER = `/**!
* tippy.js v${pkg.version}
* (c) 2017-${new Date().getFullYear()} atomiks
* MIT License
*/`;

const COMMON_IIFE_OUTPUT_OPTIONS = {
  globals: {'popper.js': 'Popper'},
  format: 'iife',
  name: 'tippy',
  esModule: false,
  sourcemap: true,
};

export default [
  {
    input: 'build/base-iife.js',
    plugins: PLUGIN_CONFIGS.iifeBase,
    external: ['popper.js'],
    output: {
      ...COMMON_IIFE_OUTPUT_OPTIONS,
      file: 'dist/tippy.iife.js',
      banner: BANNER,
    },
  },
  {
    input: 'build/bundle-iife.js',
    plugins: PLUGIN_CONFIGS.iifeBundle,
    external: ['popper.js'],
    output: {
      ...COMMON_IIFE_OUTPUT_OPTIONS,
      file: 'dist/tippy-bundle.iife.js',
      banner: BANNER,
    },
  },
  {
    input: 'build/base-iife.js',
    plugins: PLUGIN_CONFIGS.iifeBaseMin,
    external: ['popper.js'],
    output: {
      ...COMMON_IIFE_OUTPUT_OPTIONS,
      file: 'dist/tippy.iife.min.js',
    },
  },
  {
    input: 'build/bundle-iife.js',
    plugins: PLUGIN_CONFIGS.iifeBundleMin,
    external: ['popper.js'],
    output: {
      ...COMMON_IIFE_OUTPUT_OPTIONS,
      file: 'dist/tippy-bundle.iife.min.js',
    },
  },
  {
    input: {
      'dist/tippy.esm': 'build/base.js',
      'dist/tippy-bundle.esm': 'build/bundle.js',
    },
    plugins: PLUGIN_CONFIGS.bundle,
    external: ['popper.js'],
    output: {
      format: 'esm',
      dir: './',
      banner: BANNER,
      sourcemap: true,
      chunkFileNames: 'dist/tippy.chunk.esm.js',
    },
  },
  {
    input: {
      'dist/tippy.cjs': 'build/base.js',
      'dist/tippy-bundle.cjs': 'build/bundle.js',
    },
    plugins: PLUGIN_CONFIGS.bundle,
    external: ['popper.js'],
    output: {
      format: 'cjs',
      dir: './',
      exports: 'named',
      banner: BANNER,
      sourcemap: true,
      chunkFileNames: 'dist/tippy.chunk.cjs.js',
    },
  },
];
