import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import cypress from 'eslint-plugin-cypress'

export default [
  {
    ignores: [
      'dist/**',
      'playwright-report/**',
      'test-results/**'
    ]
  },

  // React application
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      'cypress/**',
      'tests/**',
      'playwright.config.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]'
        }
      ],
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true
        }
      ]
    }
  },

  // Cypress
  {
    files: ['cypress/**/*.js'],
    plugins: {
      cypress
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        ...cypress.configs.globals.languageOptions.globals
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...cypress.configs.recommended.rules
    }
  },

  // Playwright configuration
  {
    files: ['playwright.config.js'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },

  // Playwright tests
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      ...js.configs.recommended.rules
    }
  }
]