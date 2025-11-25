/**
 * Client-side helper for making authenticated requests with automatic token refresh
 */

/**
 * Make an authenticated fetch request with automatic token refresh on 401
 */
export async function authenticatedFetch(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	// Try the request
	let response = await fetch(url, options);

	// If unauthorized, try refreshing the token
	if (response.status === 401) {
		// Attempt to refresh token
		const refreshResponse = await fetch('/api/auth/refresh', {
			method: 'POST'
		});

		if (refreshResponse.ok) {
			// Retry the original request
			response = await fetch(url, options);
		} else {
			// Refresh failed, redirect to login
			window.location.href = '/?error=session_expired';
		}
	}

	return response;
}

/**
 * Check if user is authenticated (has tokens)
 */
export async function checkAuth(): Promise<boolean> {
	try {
		const response = await fetch('/api/auth/check');
		return response.ok;
	} catch {
		return false;
	}
}
