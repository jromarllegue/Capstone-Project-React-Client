import { esLint } from '@codemirror/lang-javascript'
import * as eslint from 'eslint-linter-browserify'

const jsLint = esLint(new eslint.Linter(), {
    rules: {
      "no-const-assign": "warn",
      "eqeqeq": "warn",
      "curly": "warn",
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Intl: 'readonly'
      }
    }
  });

  export default jsLint;