module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', 'storybook-static', 'coverage', 'node_modules', '**/*.stories.tsx'],
  rules: {
    // React 17+ JSX transform — React doesn't need to be in scope as a value.
    'no-undef': 'off',
    // Defer to the TS plugin's variant.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
