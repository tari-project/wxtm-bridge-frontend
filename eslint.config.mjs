import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import i18next from 'eslint-plugin-i18next'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    plugins: {
      i18next,
    },
    rules: {
      'no-console': ['warn', { allow: ['info', 'warn', 'debug', 'error'] }],
      'no-unused-vars': 'off', // base rule must be disabled
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      // DISABLED UNTIL APP IS REFACTORED TO USE TRANSLATIONS STRINGS
      // 'i18next/no-literal-string': ['error', { markupOnly: true }],
      'i18next/no-literal-string': 'off',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
]

export default eslintConfig
