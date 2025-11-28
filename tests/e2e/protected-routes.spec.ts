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
});
