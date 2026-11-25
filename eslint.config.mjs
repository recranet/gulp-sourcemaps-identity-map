import gulpConfig from 'eslint-config-gulp';

export default [
  ...gulpConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
