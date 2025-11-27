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
	const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
	const url = new URL(baseURL);
	const domain = url.hostname;

	// Set Spotify access token cookie
	await context.addCookies([
		{
			name: 'spotify_access_token',
			value: 'mock-access-token-for-e2e-tests',
			domain,
			path: '/',
			httpOnly: true,
			secure: url.protocol === 'https:',
			sameSite: 'Lax',
			// Expire in 1 hour
			expires: Math.floor(Date.now() / 1000) + 3600
		},
		{
			name: 'spotify_refresh_token',
			value: 'mock-refresh-token-for-e2e-tests',
			domain,
			path: '/',
			httpOnly: true,
			secure: url.protocol === 'https:',
			sameSite: 'Lax',
			// Expire in 30 days
			expires: Math.floor(Date.now() / 1000) + 2592000
		}
	]);
}
