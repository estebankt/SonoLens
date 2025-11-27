/**
 * Mock factories for testing
 */

import { vi } from 'vitest';

/**
 * Create a mock fetch function with predefined responses
 * @param responses - Map of request keys to responses
 * @returns Mock fetch function
 *
 * @example
 * const mockFetch = createFetchMock({
 *   'GET https://api.spotify.com/v1/me': {
 *     data: { id: 'user123', display_name: 'Test User' }
 *   },
 *   'POST https://accounts.spotify.com/api/token': {
 *     status: 401,
 *     ok: false,
 *     data: { error: 'invalid_grant' }
 *   }
 * });
 * global.fetch = mockFetch;
 */
export function createFetchMock(responses: Record<string, any>) {
	return vi.fn((url: string | URL | Request, options?: RequestInit) => {
		const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
		const method = options?.method || 'GET';
		const key = `${method} ${urlString}`;
		const response = responses[key];

		if (!response) {
			return Promise.resolve({
				ok: false,
				status: 404,
				statusText: 'Not Found',
				json: () => Promise.resolve({}),
				text: () => Promise.resolve('Not Found')
			});
		}

		return Promise.resolve({
			ok: response.ok ?? true,
			status: response.status ?? 200,
			statusText: response.statusText ?? 'OK',
			json: () => Promise.resolve(response.data || {}),
			text: () => Promise.resolve(response.text || JSON.stringify(response.data || {}))
		});
	});
}

/**
 * Create a mock File object for testing
 */
export function createMockFile(
	name: string = 'test.jpg',
	type: string = 'image/jpeg',
	size: number = 1024 * 1024
): File {
	return new File([new ArrayBuffer(size)], name, { type });
}

/**
 * Create a mock OpenAI client for testing
 * @param response - The response to return from the AI
 * @returns Mock OpenAI client
 */
export function createOpenAIMock(response: any) {
	return {
		chat: {
			completions: {
				create: vi.fn().mockResolvedValue({
					choices: [
						{
							message: { content: JSON.stringify(response) },
							finish_reason: 'stop'
						}
					]
				})
			}
		}
	};
}

/**
 * Create a mock OpenAI client that fails
 * @param error - The error to throw
 */
export function createOpenAIErrorMock(error: Error) {
	return {
		chat: {
			completions: {
				create: vi.fn().mockRejectedValue(error)
			}
		}
	};
}
