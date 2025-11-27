/**
 * SvelteKit-specific mocks for testing API endpoints
 */

import type { RequestEvent, Cookies } from '@sveltejs/kit';
import { vi } from 'vitest';

/**
 * Create mock cookies object for testing
 * @param tokens - Optional tokens to return from cookies.get()
 */
export function createMockCookies(tokens?: { access?: string; refresh?: string }): Cookies {
	const getCookieMap: Record<string, string | undefined> = {
		spotify_access_token: tokens?.access,
		spotify_refresh_token: tokens?.refresh
	};

	return {
		get: vi.fn((name: string) => getCookieMap[name] || null),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(),
		getAll: vi.fn(() => [])
	} as unknown as Cookies;
}

/**
 * Create a mock SvelteKit RequestEvent for testing API endpoints
 * @param overrides - Override default properties
 */
export function createMockRequestEvent(overrides: Partial<RequestEvent> = {}): RequestEvent {
	const defaultRequest = new Request('http://localhost:5173/api/test', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({})
	});

	return {
		request: overrides.request || defaultRequest,
		cookies: overrides.cookies || createMockCookies({ access: 'mock-access-token' }),
		params: overrides.params || {},
		url: overrides.url || new URL('http://localhost:5173/api/test'),
		locals: overrides.locals || {},
		platform: overrides.platform,
		route: overrides.route || { id: '/api/test' },
		setHeaders: vi.fn(),
		getClientAddress: vi.fn(() => '127.0.0.1'),
		isDataRequest: false,
		isSubRequest: false,
		fetch: vi.fn()
	} as unknown as RequestEvent;
}

/**
 * Create a mock request with JSON body
 */
export function createMockRequestWithBody(url: string, method: string, body: any): Request {
	return new Request(url, {
		method,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
}
