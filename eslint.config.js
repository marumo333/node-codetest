import js from '@eslint/js';
export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] }
  }
];
