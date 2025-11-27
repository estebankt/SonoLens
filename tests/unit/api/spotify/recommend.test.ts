import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../../../../src/routes/api/spotify/recommend/+server';
import {
	createMockRequestEvent,
	createMockCookies,
	createMockRequestWithBody
} from '../../../../tests/unit/helpers/sveltekit-mocks';
import { mockMoodAnalysis, mockSpotifyTrack } from '../../../../tests/unit/helpers/fixtures';

// Mock Spotify functions
vi.mock('$lib/spotify', () => ({
	processBatches: vi.fn()
}));

import { processBatches } from '$lib/spotify';

describe('API: /api/spotify/recommend', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Suppress console logs during tests
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('POST', () => {
		it('should return 401 when user is not authenticated', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{
					mood_analysis: mockMoodAnalysis
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

		it('should return 400 when mood_analysis is missing', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Missing required field: mood_analysis');
		});

		it('should return 400 when no seed tracks provided by AI', async () => {
			const emptyMood = { ...mockMoodAnalysis, seed_tracks: [] };
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{ mood_analysis: emptyMood }
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('AI did not suggest any tracks');
		});

		it('should successfully search and return tracks', async () => {
			// Mock processBatches to return an array of mocked tracks
			vi.mocked(processBatches).mockResolvedValue([mockSpotifyTrack]);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{ mood_analysis: mockMoodAnalysis }
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(processBatches).toHaveBeenCalled();
			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.tracks).toHaveLength(1);
			expect(data.tracks[0].id).toBe(mockSpotifyTrack.id);
		});

		it('should handle tracks that are not found (null results)', async () => {
			// processBatches returns mix of track and null
			vi.mocked(processBatches).mockResolvedValue([mockSpotifyTrack, null]);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{ mood_analysis: mockMoodAnalysis }
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			// Should filter out null
			expect(data.tracks).toHaveLength(1);
		});

		it('should return 404 if no tracks are found', async () => {
			// processBatches returns all nulls
			vi.mocked(processBatches).mockResolvedValue([null, null]);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{ mood_analysis: mockMoodAnalysis }
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Could not find any');
		});

		it('should handle errors during search', async () => {
			vi.mocked(processBatches).mockRejectedValue(new Error('Search failed'));

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{ mood_analysis: mockMoodAnalysis }
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Search failed');
		});

		it('should limit the number of tracks searched', async () => {
			vi.mocked(processBatches).mockResolvedValue([]);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/spotify/recommend',
				'POST',
				{
					mood_analysis: {
						...mockMoodAnalysis,
						seed_tracks: Array(50).fill('Track')
					},
					limit: 5
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			await POST(mockEvent);

			// processBatches first arg should be array of 5 items
			const callArgs = vi.mocked(processBatches).mock.calls[0];
			expect(callArgs[0]).toHaveLength(5);
		});
	});
});
