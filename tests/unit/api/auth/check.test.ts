import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '../../../../src/routes/api/auth/check/+server';
import {
	createMockRequestEvent,
	createMockCookies
} from '../../../../tests/unit/helpers/sveltekit-mocks';

describe('API: /api/auth/check', () => {
	beforeEach(() => {
		// Clear any state between tests
	});

	describe('GET', () => {
		it('should return authenticated: true when access token exists', async () => {
			const mockEvent = createMockRequestEvent({
				cookies: createMockCookies({ access: 'mock-access-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.authenticated).toBe(true);
			expect(data.accessToken).toBe('mock-access-token');
		});

		it('should return authenticated: true when only refresh token exists', async () => {
			const mockEvent = createMockRequestEvent({
				cookies: createMockCookies({ refresh: 'mock-refresh-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.authenticated).toBe(true);
		});

		it('should not include accessToken when only refresh token exists', async () => {
			const mockEvent = createMockRequestEvent({
				cookies: createMockCookies({ refresh: 'mock-refresh-token' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(data.accessToken).toBeUndefined();
		});

		it('should return authenticated: false with 401 status when no tokens exist', async () => {
			const mockEvent = createMockRequestEvent({
				cookies: createMockCookies({}) // No tokens
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.authenticated).toBe(false);
		});

		it('should prioritize access token over refresh token', async () => {
			const mockEvent = createMockRequestEvent({
				cookies: createMockCookies({ access: 'mock-access', refresh: 'mock-refresh' })
			});

			const response = await GET(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.authenticated).toBe(true);
			expect(data.accessToken).toBe('mock-access');
		});
	});
});
