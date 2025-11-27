import { test, expect } from '@playwright/test';
import { authenticateUser } from './fixtures/auth';
import {
	MOCK_MOOD_ANALYSIS,
	MOCK_TRACKS,
	MOCK_USER_PROFILE,
	MOCK_SAVED_PLAYLIST
} from './fixtures/mock-data';

test.describe('Core Flow (Authenticated)', () => {
	test.beforeEach(async ({ page, context }) => {
		// Set up authentication cookies
		await authenticateUser(context);

		// Mock all API endpoints
		await page.route('**/api/auth/check', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ authenticated: true })
			});
		});

		await page.route('**/api/me', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(MOCK_USER_PROFILE)
			});
		});

		await page.route('**/api/analyze-image', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					mood_analysis: MOCK_MOOD_ANALYSIS
				})
			});
		});

		await page.route('**/api/spotify/recommend', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					tracks: MOCK_TRACKS
				})
			});
		});

		await page.route('**/api/spotify/create-playlist', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					playlist: MOCK_SAVED_PLAYLIST
				})
			});
		});
	});

	test('should access create page when authenticated', async ({ page }) => {
		// Simply verify authenticated user can access /create page
		// This tests that auth cookies work correctly
		await page.goto('/create');

		// Verify we're on the create page (should not redirect to login)
		await expect(page).toHaveURL('/create', { timeout: 10000 });

		// Verify file input is present (indicates page loaded correctly)
		const fileInput = page.locator('input[type="file"]');
		await expect(fileInput).toBeAttached({ timeout: 5000 });
	});

	test('should show file upload interface', async ({ page }) => {
		await page.goto('/create');

		// Verify file input is present
		const fileInput = page.locator('input[type="file"]');
		await expect(fileInput).toBeAttached();

		// Verify upload button/label is visible
		const uploadLabel = page.locator('label[for="file-input"]');
		await expect(uploadLabel).toBeVisible();
	});
});
