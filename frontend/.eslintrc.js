module.exports = {
  extends: ['@ofa2/eslint-config'],
  parserOptions: {
    project: ['./tsconfig.app.json', './tsconfig.worker.json'],
  },
  globals: {},
  rules: {
    'no-console': ['off'],
    'class-methods-use-this': ['error', { exceptMethods: ['ngOnInit', 'ngOnDestroy'] }],
  },
  env: {
    browser: true,
  },
};
