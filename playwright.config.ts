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
		? 'github' // GitHub Actions annotations in CI
		: 'html', // Interactive HTML report in development

	use: {
		// Base URL from environment variable (preview URL in CI, localhost in dev)
		baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173',

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

	// Don't start local dev server in CI (tests run against deployed preview)
	webServer: process.env.CI
		? undefined
		: {
				command: 'npm run dev',
				url: 'http://localhost:5173',
				reuseExistingServer: !process.env.CI,
				timeout: 120000
			}
});
