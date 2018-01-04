module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    indentSwitchCase: true,
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never']
  }
}
