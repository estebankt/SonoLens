import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../../../../src/routes/api/spotify/create-playlist/+server';
import {
	createMockRequestEvent,
	createMockCookies,
	createMockRequestWithBody
} from '../../../../tests/unit/helpers/sveltekit-mocks';
import { mockUserProfile, mockPlaylist } from '../../../../tests/unit/helpers/fixtures';

// Mock Spotify functions
vi.mock('$lib/spotify', () => ({
	getUserProfile: vi.fn(),
	createPlaylist: vi.fn(),
	addTracksToPlaylist: vi.fn(),
	uploadPlaylistCover: vi.fn()
}));

import {
	getUserProfile,
	createPlaylist,
	addTracksToPlaylist,
	uploadPlaylistCover
} from '$lib/spotify';

describe('API: /api/spotify/create-playlist', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Suppress console logs during tests
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	describe('POST', () => {
		it('should return 401 when user is not authenticated', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test Playlist',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({}) // No tokens
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Unauthorized');
		});

		it('should return 400 when title is missing', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Missing required fields');
		});

		it('should return 400 when track_uris is missing', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test Playlist'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
		});

		it('should return 400 when track_uris is empty array', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test Playlist',
					track_uris: []
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);

			expect(response.status).toBe(400);
		});

		it('should return 400 when track_uris is not an array', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test Playlist',
					track_uris: 'not-an-array'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);

			expect(response.status).toBe(400);
		});

		it('should successfully create playlist with minimum required fields', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test Playlist',
					track_uris: ['spotify:track:123', 'spotify:track:456']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-access-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(getUserProfile).toHaveBeenCalledWith('mock-access-token');
			expect(createPlaylist).toHaveBeenCalledWith(
				'mock-access-token',
				mockUserProfile.id,
				'Test Playlist',
				expect.objectContaining({
					description: expect.stringContaining('Created with SonoLens'),
					public: true
				})
			);
			expect(addTracksToPlaylist).toHaveBeenCalledWith('mock-access-token', mockPlaylist.id, [
				'spotify:track:123',
				'spotify:track:456'
			]);
			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.playlist).toBeDefined();
			expect(data.playlist.id).toBe(mockPlaylist.id);
		});

		it('should use custom description when provided', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Custom Playlist',
					description: 'My custom description',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			await POST(mockEvent);

			expect(createPlaylist).toHaveBeenCalledWith(
				'mock-token',
				mockUserProfile.id,
				'Custom Playlist',
				expect.objectContaining({
					description: 'My custom description'
				})
			);
		});

		it('should respect is_public flag when false', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Private Playlist',
					track_uris: ['spotify:track:123'],
					is_public: false
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			await POST(mockEvent);

			expect(createPlaylist).toHaveBeenCalledWith(
				'mock-token',
				mockUserProfile.id,
				'Private Playlist',
				expect.objectContaining({
					public: false
				})
			);
		});

		it('should upload cover image when provided', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);
			vi.mocked(uploadPlaylistCover).mockResolvedValue(undefined);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Playlist with Cover',
					track_uris: ['spotify:track:123'],
					cover_image: 'base64-encoded-image-data'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			await POST(mockEvent);

			expect(uploadPlaylistCover).toHaveBeenCalledWith(
				'mock-token',
				mockPlaylist.id,
				'base64-encoded-image-data'
			);
		});

		it('should succeed even if cover upload fails', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);
			vi.mocked(uploadPlaylistCover).mockRejectedValue(new Error('Image upload failed'));

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Playlist',
					track_uris: ['spotify:track:123'],
					cover_image: 'invalid-image'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(console.warn).toHaveBeenCalled();
		});

		it('should not call uploadPlaylistCover when no cover_image provided', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Playlist',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			await POST(mockEvent);

			expect(uploadPlaylistCover).not.toHaveBeenCalled();
		});

		it('should return 500 when getUserProfile fails', async () => {
			vi.mocked(getUserProfile).mockRejectedValue(new Error('Failed to get user profile'));

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Failed to get user profile');
		});

		it('should return 500 when createPlaylist fails', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockRejectedValue(new Error('Playlist creation failed'));

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
		});

		it('should return 500 when addTracksToPlaylist fails', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockRejectedValue(new Error('Failed to add tracks'));

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
		});

		it('should return playlist details in response', async () => {
			vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
			vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
			vi.mocked(addTracksToPlaylist).mockResolvedValue(undefined);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/create-playlist',
				'POST',
				{
					title: 'Test',
					track_uris: ['spotify:track:123']
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(data.playlist).toEqual({
				id: mockPlaylist.id,
				name: mockPlaylist.name,
				url: mockPlaylist.external_urls.spotify,
				uri: mockPlaylist.uri
			});
		});
	});
});
