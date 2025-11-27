import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for SonoLens E2E tests
 *
 * Tests run against preview deployments in CI, or local dev server in development.
 * All external APIs (Spotify, OpenAI) are mocked for fast, deterministic execution.
 */
export default defineConfig({
	testDir: './tests/e2e',

	// Run tests sequentially for predictable state
	fullyParallel: false,

	// Fail CI if test.only() is accidentally left in
	forbidOnly: !!process.env.CI,

	// Retry failed tests in CI to handle flakiness
	retries: process.env.CI ? 2 : 0,

	// Single worker for deterministic testing
	workers: 1,

	// Reporter configuration
	reporter: process.env.CI
		? [['github'], ['html']] // Use both in CI
		: 'html', // Interactive HTML report in development

	use: {
		// Base URL: Use env var if set (e.g. Vercel Preview), otherwise localhost
		baseURL:
			process.env.PLAYWRIGHT_TEST_BASE_URL ||
			(process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173'),

		// Trace on first retry for debugging
		trace: 'on-first-retry',

		// Screenshots and videos on failure
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',

		// Timeouts
		actionTimeout: 10000,
		navigationTimeout: 30000
	},

	// Test configuration
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],

	// Start server only if we're not testing a remote URL
	webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
		? undefined
		: process.env.CI
			? {
					command: 'npm run preview',
					url: 'http://localhost:4173',
					reuseExistingServer: false,
					timeout: 120000
				}
			: {
					command: 'npm run dev',
					url: 'http://localhost:5173',
					reuseExistingServer: true,
					timeout: 120000
				}
});
