import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	// Ignore patterns
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'.vercel/**',
			'node_modules/**',
			'vite.config.ts.timestamp-*',
			'playwright-report/**',
			'test-results/**'
		]
	},

	// JavaScript/TypeScript files
	{
		files: ['**/*.js', '**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module'
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021,
				RequestInit: 'readonly',
				Response: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...js.configs.recommended.rules,
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
			'no-undef': 'off' // TypeScript handles this better
		}
	},

	// Svelte files
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser
			}
		},
		plugins: {
			svelte
		},
		rules: {
			...svelte.configs.recommended.rules,
			'svelte/no-at-html-tags': 'warn'
		}
	},

	// Test files - allow console
	{
		files: ['**/*.test.ts', '**/*.spec.ts', '**/vitest-setup.ts'],
		rules: {
			'no-console': 'off'
		}
	},

	// Prettier - must be last to override other configs
	prettier
];
