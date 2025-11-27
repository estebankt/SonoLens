import { test, expect } from '@playwright/test';
import { authenticateUser } from './fixtures/auth';
import {
	MOCK_MOOD_ANALYSIS,
	MOCK_TRACKS,
	MOCK_USER_PROFILE,
	MOCK_SAVED_PLAYLIST
} from './fixtures/mock-data';
import { getTestImageFile, INVALID_GIF_FILE } from './fixtures/test-images';

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

	test('should complete full flow: upload → analyze → generate → save', async ({ page }) => {
		// 1. Navigate to dashboard (should be accessible with auth cookies)
		await page.goto('/dashboard');
		await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 10000 });

		// 2. Click "Create Playlist from Image" button
		const createButton = page.locator('text=Create Playlist from Image');
		await expect(createButton).toBeVisible();
		await createButton.click();

		// 3. Verify we're on the create page
		await expect(page).toHaveURL('/create');

		// 4. Upload test image
		const fileInput = page.locator('input[type="file"]');
		await expect(fileInput).toBeAttached();

		const testImage = getTestImageFile();
		await fileInput.setInputFiles(testImage);

		// 5. Wait for preview to appear (indicates client-side validation passed)
		await expect(
			page.locator('img[alt*="review"]').or(page.locator('img[alt*="Upload"]'))
		).toBeVisible({
			timeout: 5000
		});

		// 6. Click "Analyze Image" button (or equivalent)
		const analyzeButton = page
			.locator('button:has-text("Analyze")')
			.or(page.locator('button:has-text("Continue")'));
		await expect(analyzeButton).toBeVisible();
		await analyzeButton.click();

		// 7. Wait for mood analysis to display
		await expect(
			page
				.locator('text=Mood Analysis')
				.or(page.locator(`text=${MOCK_MOOD_ANALYSIS.suggested_playlist_title}`))
		).toBeVisible({ timeout: 15000 });

		// Verify mood details are shown
		await expect(page.locator(`text=${MOCK_MOOD_ANALYSIS.mood_tags[0]}`)).toBeVisible();

		// 8. Click "Generate Playlist" button
		const generateButton = page
			.locator('button:has-text("Generate")')
			.or(page.locator('button:has-text("Continue")'));
		await expect(generateButton).toBeVisible();
		await generateButton.click();

		// 9. Wait for tracks to display
		await expect(page.locator(`text=${MOCK_TRACKS[0].name}`)).toBeVisible({ timeout: 15000 });

		// Verify track list is shown
		await expect(page.locator(`text=${MOCK_TRACKS[0].artists[0].name}`)).toBeVisible();

		// 10. Click "Save to Spotify" button
		const saveButton = page.locator('button:has-text("Save")');
		await expect(saveButton).toBeVisible();
		await saveButton.click();

		// 11. Verify success message
		await expect(page.locator('text=Playlist Saved').or(page.locator('text=Success'))).toBeVisible({
			timeout: 15000
		});

		// Verify "Open in Spotify" link or similar success indicator
		await expect(
			page.locator('a[href*="spotify.com"]').or(page.locator('text=Open'))
		).toBeVisible();
	});

	test('should handle image upload validation errors', async ({ page }) => {
		await page.goto('/create');

		// Try to upload an invalid file type (GIF)
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(INVALID_GIF_FILE);

		// Verify error message appears
		// Note: Error message may vary based on implementation
		const errorLocator = page
			.locator('.bg-red')
			.or(page.locator('text=/invalid|supported|error/i'));
		await expect(errorLocator).toBeVisible({ timeout: 5000 });
	});

	test('should navigate back through wizard steps', async ({ page }) => {
		await page.goto('/create');

		// Upload image
		const fileInput = page.locator('input[type="file"]');
		const testImage = getTestImageFile();
		await fileInput.setInputFiles(testImage);

		// Wait for preview
		await expect(
			page.locator('img[alt*="review"]').or(page.locator('img[alt*="Upload"]'))
		).toBeVisible();

		// Click analyze
		const analyzeButton = page
			.locator('button:has-text("Analyze")')
			.or(page.locator('button:has-text("Continue")'));
		await analyzeButton.click();

		// Wait for mood analysis
		await expect(
			page
				.locator('text=Mood Analysis')
				.or(page.locator(`text=${MOCK_MOOD_ANALYSIS.suggested_playlist_title}`))
		).toBeVisible({ timeout: 15000 });

		// Look for "Back" button
		const backButton = page.locator('button:has-text("Back")');
		if (await backButton.isVisible()) {
			await backButton.click();

			// Verify we're back at upload step
			await expect(page.locator('input[type="file"]')).toBeVisible();
		}
	});
});
