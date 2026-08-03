// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'dist-android/**',
      'dist-check/**',
      'dist-web/**',
      '.expo/**',
      '.venv/**',
      '.venv-1/**',
      'backend/**',
    ],
  },
]);
