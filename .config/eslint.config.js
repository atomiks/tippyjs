module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  globals: {
    __DEV__: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-use-before-define': ['error', {functions: false}],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  ignorePatterns: [
    'node_modules',
    'build',
    'animations',
    'themes',
    'test',
    'headless',
    'website',
    'dist',
    'coverage',
  ],
};
