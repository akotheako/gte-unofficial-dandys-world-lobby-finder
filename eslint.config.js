import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{js,ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
		],
		plugins: {
			'@stylistic': stylistic,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			// Multiline text is written as one template literal with its real line breaks,
			// so its lines are allowed to run past the limit.
			'@stylistic/max-len': [
				'error',
				{
					code: 100,
					tabWidth: 0,
					ignoreTemplateLiterals: true,
					ignoreUrls: true,
				},
			],
			'@stylistic/object-curly-newline': [
				'error',
				{
					ObjectExpression: {
						minProperties: 2,
						consistent: true,
					},
					ObjectPattern: {
						minProperties: 2,
						consistent: true,
					},
					TSTypeLiteral: {
						minProperties: 2,
						consistent: true,
					},
					ImportDeclaration: {
						consistent: true,
					},
					ExportDeclaration: {
						consistent: true,
					},
				},
			],
			'@stylistic/object-property-newline': 'error',
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/semi': [
				'error',
				'never',
			],
			'@stylistic/comma-dangle': [
				'error',
				'always-multiline',
			],
			'@stylistic/indent': [
				'error',
				'tab',
			],
			'@stylistic/jsx-indent-props': [
				'error',
				'tab',
			],
			'@stylistic/jsx-max-props-per-line': [
				'error',
				{
					maximum: 1,
				},
			],
			'@stylistic/jsx-first-prop-new-line': [
				'error',
				'multiprop',
			],
		},
	},
])
