import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import i18next from 'eslint-plugin-i18next'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      i18next,
    },
    rules: {
      'i18next/no-literal-string': ['warn', { markupOnly: true }],
    },
  },
]

export default eslintConfig
