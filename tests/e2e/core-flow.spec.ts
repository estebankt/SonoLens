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

	test('should complete full flow: upload → analyze → generate → save', async ({ page }) => {
		await page.goto('/create');
		await page.waitForLoadState('networkidle'); // Ensure page is fully loaded/hydrated

		// 1. Upload Image
		// Create a dummy image buffer (red pixel)
		const buffer = Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
			'base64'
		);

		// Setup the wait for the API REQUEST (not response yet) to confirm trigger
		const analyzeRequestPromise = page.waitForRequest((request) =>
			request.url().includes('/api/analyze-image')
		);

		const fileInput = page.locator('input[type="file"]');
		// Set the file on the input element
		// Note: The input might be hidden or styled, so we target it directly
		await fileInput.setInputFiles({
			name: 'test-image.png',
			mimeType: 'image/png',
			buffer
		});

		// Verify file is selected (UI updated)
		await expect(page.getByText('test-image.png')).toBeVisible();

		// Click "Analyze Image" to trigger the API call (it's not automatic)
		const analyzeButton = page.getByRole('button', { name: 'Analyze Image' });
		await analyzeButton.click();

		// Wait for the request to be sent
		await analyzeRequestPromise;

		await expect(page.getByRole('heading', { name: 'Mood', level: 3 })).toBeVisible({
			timeout: 5000
		});
		await expect(page.getByRole('heading', { name: 'Energy', level: 3 })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Genres', level: 3 })).toBeVisible();

		// Verify mock data is displayed (using MOCK_MOOD_ANALYSIS values)
		await expect(page.getByText(MOCK_MOOD_ANALYSIS.mood_tags[0])).toBeVisible(); // e.g., 'calm'
		await expect(page.getByText(MOCK_MOOD_ANALYSIS.energy_level)).toBeVisible(); // e.g., 'low'
		await expect(page.getByText(MOCK_MOOD_ANALYSIS.recommended_genres[0])).toBeVisible(); // e.g., 'ambient'

		// 3. Generate Playlist
		const generateButton = page.getByRole('button', { name: 'Generate Playlist' });
		await expect(generateButton).toBeVisible();
		await generateButton.click();

		// 4. Verify Tracks Display (Wait for API call and UI update)
		// The UI shows the playlist title, not "Recommended Tracks"
		await expect(
			page
				.getByRole('heading', { name: MOCK_MOOD_ANALYSIS.suggested_playlist_title, level: 2 })
				.first()
		).toBeVisible({ timeout: 10000 });

		// Verify at least one mock track is visible
		// Assuming mock data has a track like "Midnight City"
		const firstTrack = MOCK_TRACKS[0];
		if (firstTrack) {
			await expect(page.getByText(firstTrack.name).first()).toBeVisible();
			await expect(page.getByText(firstTrack.artists[0].name).first()).toBeVisible();
		}

		// 5. Save to Spotify
		const saveButton = page.getByRole('button', { name: 'Save to Spotify' });
		await expect(saveButton).toBeVisible();
		await saveButton.click();

		// 6. Verify Success
		// Wait for success toast or modal
		await expect(page.getByRole('heading', { name: 'Playlist Saved to Spotify!' })).toBeVisible({
			timeout: 10000
		});

		// Verify link to Spotify is present
		// Using getByText because the element appears as 'generic' in the snapshot
		const spotifyLink = page.getByText('Open in Spotify');
		await expect(spotifyLink).toBeVisible();

		// Optional: Check if it's a link or wrapped in one
		// await expect(spotifyLink.locator('xpath=..')).toHaveAttribute('href', MOCK_SAVED_PLAYLIST.external_urls.spotify);
	});
});
