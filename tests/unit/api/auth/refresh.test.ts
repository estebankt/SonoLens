import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../../../../src/routes/api/auth/refresh/+server';
import {
	createMockRequestEvent,
	createMockCookies
} from '../../../../tests/unit/helpers/sveltekit-mocks';

// Mock the spotify module
vi.mock('$lib/spotify', () => ({
	refreshToken: vi.fn()
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({
	SPOTIFY_CLIENT_ID: 'test-client-id'
}));

import { refreshToken } from '$lib/spotify';

describe('API: /api/auth/refresh', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST', () => {
		it('should successfully refresh token and update cookies', async () => {
			const mockTokens = {
				access_token: 'new-access-token',
				expires_in: 3600
			};

			vi.mocked(refreshToken).mockResolvedValue(mockTokens);

			const mockCookies = createMockCookies({ refresh: 'mock-refresh-token' });
			const mockEvent = createMockRequestEvent({
				cookies: mockCookies,
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(refreshToken).toHaveBeenCalledWith('mock-refresh-token', 'test-client-id');
			expect(mockCookies.set).toHaveBeenCalledWith(
				'spotify_access_token',
				'new-access-token',
				expect.objectContaining({
					httpOnly: true,
					path: '/',
					sameSite: 'lax',
					maxAge: 3600
				})
			);
			expect(data.success).toBe(true);
		});

		it('should throw 401 error when no refresh token exists', async () => {
			const mockCookies = createMockCookies({}); // No tokens
			const mockEvent = createMockRequestEvent({
				cookies: mockCookies,
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			await expect(POST(mockEvent as any)).rejects.toThrow();
		});

		it('should clear cookies and throw 401 when refresh fails', async () => {
			vi.mocked(refreshToken).mockRejectedValue(new Error('Invalid refresh token'));

			const mockCookies = createMockCookies({ refresh: 'invalid-refresh-token' });
			const mockEvent = createMockRequestEvent({
				cookies: mockCookies,
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			await expect(POST(mockEvent as any)).rejects.toThrow();

			// Verify cookies were cleared
			expect(mockCookies.delete).toHaveBeenCalledWith('spotify_access_token', { path: '/' });
			expect(mockCookies.delete).toHaveBeenCalledWith('spotify_refresh_token', { path: '/' });
		});

		it('should handle network errors during refresh', async () => {
			vi.mocked(refreshToken).mockRejectedValue(new Error('Network error'));

			const mockCookies = createMockCookies({ refresh: 'mock-refresh-token' });
			const mockEvent = createMockRequestEvent({
				cookies: mockCookies,
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			await expect(POST(mockEvent as any)).rejects.toThrow();
			expect(mockCookies.delete).toHaveBeenCalled();
		});

		it('should use correct cookie settings for access token', async () => {
			const mockTokens = {
				access_token: 'new-token',
				expires_in: 7200
			};

			vi.mocked(refreshToken).mockResolvedValue(mockTokens);

			const mockCookies = createMockCookies({ refresh: 'mock-refresh' });
			const mockEvent = createMockRequestEvent({
				cookies: mockCookies,
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			await POST(mockEvent as any);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'spotify_access_token',
				'new-token',
				expect.objectContaining({
					httpOnly: true,
					secure: false,
					path: '/',
					sameSite: 'lax',
					maxAge: 7200
				})
			);
		});

		it('should return success: true on successful refresh', async () => {
			vi.mocked(refreshToken).mockResolvedValue({
				access_token: 'token',
				expires_in: 3600
			});

			const mockEvent = createMockRequestEvent({
				cookies: createMockCookies({ refresh: 'refresh-token' }),
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true });
		});

		it('should not update refresh token cookie', async () => {
			vi.mocked(refreshToken).mockResolvedValue({
				access_token: 'new-access',
				expires_in: 3600
			});

			const mockCookies = createMockCookies({ refresh: 'mock-refresh' });
			const mockEvent = createMockRequestEvent({
				cookies: mockCookies,
				request: new Request('http://localhost:5173/api/auth/refresh', {
					method: 'POST'
				})
			});

			await POST(mockEvent as any);

			// Should only set access token, not refresh token
			expect(mockCookies.set).toHaveBeenCalledTimes(1);
			expect(mockCookies.set).toHaveBeenCalledWith(
				'spotify_access_token',
				expect.any(String),
				expect.any(Object)
			);
		});
	});
});
