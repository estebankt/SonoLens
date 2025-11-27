import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../../../../src/routes/api/spotify/search-tracks/+server';
import {
	createMockRequestEvent,
	createMockCookies
} from '../../../../tests/unit/helpers/sveltekit-mocks';
import { mockSearchResponse } from '../../../../tests/unit/helpers/fixtures';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('API: /api/spotify/search-tracks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('GET', () => {
		it('should return 400 when query is missing', async () => {
			const mockEvent = createMockRequestEvent({
				url: new URL('http://localhost:5173/api/spotify/search-tracks'),
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('required');
		});

		it('should return 401 when user is not authenticated', async () => {
			const mockEvent = createMockRequestEvent({
				url: new URL('http://localhost:5173/api/spotify/search-tracks?q=test'),
				cookies: createMockCookies({}) // No tokens
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Not authenticated');
		});

		it('should search and return tracks successfully', async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSearchResponse
			});

			const mockEvent = createMockRequestEvent({
				url: new URL('http://localhost:5173/api/spotify/search-tracks?q=Holocene'),
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(fetchMock).toHaveBeenCalledWith(
				expect.stringContaining('q=Holocene'),
				expect.objectContaining({
					headers: { Authorization: 'Bearer mock-token' }
				})
			);
			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.tracks).toHaveLength(1);
			expect(data.tracks[0].name).toBe('Holocene');
		});

		it('should return 401 when Spotify token expires', async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: 'Unauthorized'
			});

			const mockEvent = createMockRequestEvent({
				url: new URL('http://localhost:5173/api/spotify/search-tracks?q=test'),
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
			expect(data.error).toContain('expired');
		});

		it('should return 500 on Spotify API failure', async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});

			const mockEvent = createMockRequestEvent({
				url: new URL('http://localhost:5173/api/spotify/search-tracks?q=test'),
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain('500');
		});

		it('should handle network errors', async () => {
			fetchMock.mockRejectedValueOnce(new Error('Network error'));

			const mockEvent = createMockRequestEvent({
				url: new URL('http://localhost:5173/api/spotify/search-tracks?q=test'),
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Network error');
		});
	});
});