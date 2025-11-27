import { type BrowserContext } from '@playwright/test';

/**
 * Bypass Spotify OAuth by setting auth cookies directly in Playwright context
 *
 * This simulates a logged-in user without requiring real OAuth flow.
 * The mock tokens are set as httpOnly cookies (which can only be set via Playwright,
 * not browser JavaScript), allowing tests to access protected routes.
 *
 * @param context - Playwright browser context
 */
export async function authenticateUser(context: BrowserContext) {
	// Use localhost for both dev and CI (preview server)
	const baseURL = process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173';

	// Set Spotify access token cookie
	await context.addCookies([
		{
			name: 'spotify_access_token',
			value: 'mock-access-token-for-e2e-tests',
			url: baseURL,
			httpOnly: true,
			secure: false, // Always false for localhost
			sameSite: 'Lax',
			// Expire in 1 hour
			expires: Math.floor(Date.now() / 1000) + 3600
		},
		{
			name: 'spotify_refresh_token',
			value: 'mock-refresh-token-for-e2e-tests',
			url: baseURL,
			httpOnly: true,
			secure: false, // Always false for localhost
			sameSite: 'Lax',
			// Expire in 30 days
			expires: Math.floor(Date.now() / 1000) + 2592000
		}
	]);
}
