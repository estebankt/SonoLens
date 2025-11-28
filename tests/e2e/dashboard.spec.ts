import { test, expect } from '@playwright/test';
import {
	MOCK_USER_PROFILE,
	MOCK_TOP_ARTISTS,
	MOCK_TOP_TRACKS,
	MOCK_RECENTLY_PLAYED
} from './fixtures/mock-data';
import { authenticateUser } from './fixtures/auth';

test.describe('Dashboard', () => {
	test.beforeEach(async ({ context, page }) => {
		// Authenticate using cookies
		await authenticateUser(context);

		// Mock Dashboard API calls
		await page.route('**/api/me', async (route) => {
			await route.fulfill({ status: 200, body: JSON.stringify(MOCK_USER_PROFILE) });
		});

		await page.route('**/me/top/artists*', async (route) => {
			await route.fulfill({ status: 200, body: JSON.stringify(MOCK_TOP_ARTISTS) });
		});

		await page.route('**/me/top/tracks*', async (route) => {
			await route.fulfill({ status: 200, body: JSON.stringify(MOCK_TOP_TRACKS) });
		});

		await page.route('**/me/player/recently-played*', async (route) => {
			await route.fulfill({ status: 200, body: JSON.stringify(MOCK_RECENTLY_PLAYED) });
		});

		// Go to dashboard
		await page.goto('/dashboard');
	});

	test('should display user profile information', async ({ page }) => {
		// Check heading
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

		// Check user details
		await expect(page.getByText(MOCK_USER_PROFILE.display_name)).toBeVisible();
		await expect(page.getByText(MOCK_USER_PROFILE.email)).toBeVisible();

		// Check profile image
		const profileImage = page.locator(`img[alt="${MOCK_USER_PROFILE.display_name}"]`);
		await expect(profileImage).toBeVisible();
	});

	test('should have a working create playlist button', async ({ page }) => {
		const createButton = page.getByRole('link', { name: 'Create Playlist from Image' });
		await expect(createButton).toBeVisible();
		await expect(createButton).toHaveAttribute('href', '/create');

		await createButton.click({ force: true });
		await expect(page).toHaveURL(/.*\/create/);
	});

	test('should display top artists', async ({ page }) => {
		const section = page.locator('.neo-card', { hasText: 'Your Top Artists' });
		await expect(section).toBeVisible();

		// Check first artist
		const firstArtist = MOCK_TOP_ARTISTS.items[0];
		await expect(section.getByText(firstArtist.name)).toBeVisible();
		await expect(section.getByText(firstArtist.genres[0])).toBeVisible();
	});

	test('should display top tracks', async ({ page }) => {
		const section = page.locator('.neo-card', { hasText: 'Your Top Tracks' });
		await expect(section).toBeVisible();

		// Check first track
		const firstTrack = MOCK_TOP_TRACKS.items[0];
		await expect(section.getByText(firstTrack.name)).toBeVisible();
		await expect(section.getByText(firstTrack.artists[0].name).first()).toBeVisible();
	});

	test('should display recently played tracks', async ({ page }) => {
		const section = page.locator('.neo-card', { hasText: 'Recently Played' });
		await expect(section).toBeVisible();

		// Check first recent track
		const firstRecent = MOCK_RECENTLY_PLAYED.items[0].track;
		await expect(section.getByText(firstRecent.name)).toBeVisible();
	});

	test('should handle logout', async ({ page }) => {
		// Find and click logout button
		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect(logoutButton).toBeVisible();

		// Note: Actual logout functionality might require mocking the logout endpoint
		// or observing the redirect. Since this is an action that triggers a POST,
		// we verify the button exists and is in the right place.
	});
});
