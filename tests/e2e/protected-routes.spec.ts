import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
	test('should redirect unauthenticated user from /create to home', async ({ page }) => {
		// Attempt to access protected route without auth
		await page.goto('/create');

		// Should redirect to home page
		await expect(page).toHaveURL('/');

		// Should verify we are on home page (e.g. check for "SonoLens" title or login button)
		await expect(page.getByRole('heading', { name: 'SonoLens' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Login with Spotify' })).toBeVisible();
	});

	test('should redirect unauthenticated user from /dashboard to home', async ({ page }) => {
		// Attempt to access protected route without auth
		await page.goto('/dashboard');

		// Should redirect to home page
		await expect(page).toHaveURL('/');

		// Should verify we are on home page
		await expect(page.getByRole('heading', { name: 'SonoLens' })).toBeVisible();
	});

	test('should redirect user with invalid token from /create to home', async ({
		context,
		page
	}) => {
		const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';

		// Set invalid cookies
		await context.addCookies([
			{
				name: 'spotify_access_token',
				value: 'invalid-token',
				url: baseURL,
				httpOnly: true
			}
		]);

		await page.goto('/create');
		// Expect redirect to home, possibly with error param
		await expect(page).toHaveURL(/\/\?error=session_expired/);
	});
});
