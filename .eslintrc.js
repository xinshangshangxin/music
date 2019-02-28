module.exports = {
  globals: {},
  extends: ['@s4p/eslint-config'],
  rules: {
    '@typescript-eslint/camelcase': ['error', { allow: ['app_key', 'csrf_token'] }],
  },
};
