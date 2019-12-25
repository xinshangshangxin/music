module.exports = {
  plugins: ['rxjs'],
  extends: ['@ofa2/eslint-config'],
  parserOptions: {
    project: ['./tsconfig.app.json', './tsconfig.worker.json'],
  },
  globals: {},
  rules: {
    'no-console': ['off'],
    'class-methods-use-this': ['error', { exceptMethods: ['ngOnInit', 'ngOnDestroy'] }],

    'rxjs/no-compat': ['error'],
    'rxjs/no-ignored-error': ['error'],
    'rxjs/no-nested-subscribe': ['error'],
    'rxjs/no-unsafe-catch': ['error'],
    'rxjs/no-unsafe-switchmap': ['error'],
    'rxjs/no-unsafe-takeuntil': ['error'],
  },
  env: {
    browser: true,
  },
};
