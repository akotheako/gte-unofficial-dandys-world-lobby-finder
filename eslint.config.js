// eslint.config.js
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import ts from 'typescript-eslint'
import svelteParser from 'svelte-eslint-parser'
import svelteConfig from './svelte.config.js'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default [
	includeIgnoreFile(gitignorePath),

	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,

	// JS/TS
	{
		files: ['**/*.{js,cjs,mjs,ts,tsx}'],
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parser: ts.parser,
			parserOptions: { projectService: true },
		},
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				ignoreRestSiblings: true,
			}],
			'indent': ['error', 4, { SwitchCase: 1 }],
			'eol-last': ['error', 'always'],
			'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
			'comma-dangle': ['error', 'always-multiline'],
			'semi': ['error', 'never'],
		},
	},

	// Svelte
	{
		files: ['**/*.svelte'],
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parser: svelteParser,
			parserOptions: {
				parser: ts.parser,
				projectService: true,
				svelteConfig,
				extraFileExtensions: ['.svelte'],
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				ignoreRestSiblings: true,
			}],
			'svelte/indent': ['error', { indent: 4 }],
			'eol-last': ['error', 'always'],
			'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
			'comma-dangle': ['error', 'always-multiline'],
			'semi': ['error', 'never'],
		},
	},
]
