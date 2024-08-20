export default [
  {
    ignores: ['node_modules', '**/node_modules/**', 'dist', '**/dist/**'],
    typescript: true,
    formatters: true,

    stylistic: {
      semi: true,
    },

    rules: {
      'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      curly: ['error', 'all'],

      'no-console': ['off'],
    },
  },
  {
    files: ['**/*.json5'],
    rules: {
      'jsonc/quote-props': ['error', 'as-needed'],
      'jsonc/quotes': ['error', 'single'],
      'jsonc/no-number-props': ['off'],
    },
  },
];
