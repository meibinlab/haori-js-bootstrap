import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // ビルド成果物・テスト出力・ローカルのツール類は検査しない。`.mamori` は
    // Mamori Inspector が置くローカル専用ディレクトリで、リポジトリの管理対象外
    // （`.git/info/exclude` で除外）だが、除外しないと eslint が拾ってしまう。
    ignores: [
      'dist',
      'dist-demo',
      'dist_test',
      'coverage',
      'test-results',
      '.mamori',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['demo/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
