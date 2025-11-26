// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Updated to include 'tests' folder AND 'src' folder
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		// Exclude server-side tests and Svelte component tests for now
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.svelte-kit/**',
			'src/lib/server/**/*.test.ts',
			'tests/example.test.ts'
		],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest-setup.ts']
	}
});