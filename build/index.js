// This file builds the CSS dist files. The main `rollup.config.js` builds the
// JS dist files.

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
const sass = require('rollup-plugin-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const resolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const cssOnly = require('rollup-plugin-css-only');
const replace = require('rollup-plugin-replace');

const NAMESPACE_PREFIX = process.env.NAMESPACE || 'tippy';
const THEME = process.env.THEME;

const BASE_OUTPUT_CONFIG = {
  name: 'tippy',
  globals: {'popper.js': 'Popper'},
  sourcemap: true,
};

const PLUGINS = {
  babel: babel({
    exclude: 'node_modules/**',
    extensions: ['.js', '.ts'],
  }),
  replaceNamespace: replace({
    __NAMESPACE_PREFIX__: NAMESPACE_PREFIX,
  }),
  resolve: resolve({extensions: ['.js', '.ts']}),
  css: cssOnly({output: false}),
  json: json(),
};

const PLUGIN_CONFIG = [
  PLUGINS.babel,
  PLUGINS.replaceNamespace,
  PLUGINS.resolve,
  PLUGINS.json,
  PLUGINS.css,
];

function createPluginSCSS(output, shouldInjectNodeEnvTheme = false) {
  let data = `$namespace-prefix: ${NAMESPACE_PREFIX};`;

  if (shouldInjectNodeEnvTheme && THEME) {
    data += `@import './themes/${THEME}.scss';`;
  }

  return sass({
    output,
    options: {data},
    processor(css) {
      return postcss([autoprefixer, cssnano])
        .process(css, {from: undefined})
        .then((result) => result.css);
    },
  });
}

function createRollupConfig(inputFile, plugins) {
  return {
    input: `./build/${inputFile}`,
    external: ['popper.js'],
    plugins,
  };
}

async function build() {
  // Create `index.d.ts` file from `src/types.ts`
  fs.copyFileSync('./src/types.ts', './index.d.ts');

  // Create base CSS files
  for (const filename of fs.readdirSync(`./build/css`)) {
    const cssConfig = createRollupConfig(
      `css/${filename}`,
      PLUGIN_CONFIG.concat(
        createPluginSCSS(`./dist/${filename.replace('.js', '.css')}`, true)
      )
    );
    const cssBundle = await rollup(cssConfig);
    await cssBundle.write({
      ...BASE_OUTPUT_CONFIG,
      sourcemap: false,
      format: 'umd',
      file: './index.js',
    });
  }

  // Themes + animations
  for (const folder of ['themes', 'animations']) {
    for (const filename of fs.readdirSync(`./build/${folder}`)) {
      const filenameWithCSSExtension = filename.replace('.js', '.css');
      const outputFile = `./${folder}/${filenameWithCSSExtension}`;

      const config = createRollupConfig(
        `${folder}/${filename}`,
        PLUGIN_CONFIG.concat(createPluginSCSS(outputFile))
      );
      const bundle = await rollup(config);
      await bundle.write({
        ...BASE_OUTPUT_CONFIG,
        format: 'umd',
        sourcemap: false,
        file: 'index.js',
      });
    }
  }

  fs.unlinkSync('./index.js');
}

build();
