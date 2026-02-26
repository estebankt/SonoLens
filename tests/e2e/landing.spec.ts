import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
	test('should load and display login button', async ({ page }) => {
		await page.goto('/');

		// Verify hero content
		await expect(page.locator('h1')).toContainText('SonoLens');
		await expect(page.locator('text=Transform images into Spotify playlists')).toBeVisible();

		// Verify login button is present
		const loginButton = page.locator('a[href="/auth/login"]');
		await expect(loginButton).toBeVisible();
		await expect(loginButton).toContainText('Login with Spotify');
	});

	test('should display error message for access_denied', async ({ page }) => {
		await page.goto('/?error=access_denied');

		// Verify error message is displayed
		const errorCard = page.locator('.neo-card.bg-red-50');
		await expect(errorCard).toBeVisible();
		await expect(errorCard).toContainText('You denied access to Spotify');
	});

	test('should display error message for session_expired', async ({ page }) => {
		await page.goto('/?error=session_expired');

		// Verify error message is displayed
		const errorCard = page.locator('.neo-card.bg-red-50');
		await expect(errorCard).toBeVisible();
		await expect(errorCard).toContainText('Your session has expired');
	});

	test('should display error message for token_exchange_failed', async ({ page }) => {
		await page.goto('/?error=token_exchange_failed');

		// Verify error message is displayed
		const errorCard = page.locator('.neo-card.bg-red-50');
		await expect(errorCard).toBeVisible();
		await expect(errorCard).toContainText('Failed to exchange authorization code');
	});

	test('should handle unknown error gracefully', async ({ page }) => {
		await page.goto('/?error=unknown_error');

		// Verify generic error message is displayed
		const errorCard = page.locator('.neo-card.bg-red-50');
		await expect(errorCard).toBeVisible();
		await expect(errorCard).toContainText('An unknown error occurred');
	});

	test('should display Try Demo button', async ({ page }) => {
		await page.goto('/');

		const demoButton = page.locator('a[href="/demo"]');
		await expect(demoButton).toBeVisible();
		await expect(demoButton).toContainText('Try Demo');
	});

	test('should redirect to /create and set demo cookie when clicking Try Demo', async ({
		page
	}) => {
		await page.goto('/');
		await page.click('a[href="/demo"]');

		await expect(page).toHaveURL('/create', { timeout: 10000 });

		const cookies = await page.context().cookies();
		const demoCookie = cookies.find((c) => c.name === 'demo_mode');
		expect(demoCookie).toBeDefined();
		expect(demoCookie?.value).toBe('true');
	});
});
