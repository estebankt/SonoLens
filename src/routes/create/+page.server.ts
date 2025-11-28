import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { refreshToken } from '$lib/spotify';
import { SPOTIFY_CLIENT_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ cookies }) => {
	let accessToken = cookies.get('spotify_access_token');
	const refreshTokenValue = cookies.get('spotify_refresh_token');

	// Redirect to home if not authenticated
	if (!accessToken && !refreshTokenValue) {
		throw redirect(302, '/');
	}

	// Mock data check for E2E testing
	if (accessToken === 'mock-access-token-for-e2e-tests') {
		return {};
	}

	// If no access token but we have refresh token, try to refresh
	if (!accessToken && refreshTokenValue) {
		try {
			const tokens = await refreshToken(refreshTokenValue, SPOTIFY_CLIENT_ID);
			accessToken = tokens.access_token;

			// Update access token cookie
			cookies.set('spotify_access_token', tokens.access_token, {
				httpOnly: true,
				secure: false, // Set to true in production
				path: '/',
				sameSite: 'lax',
				maxAge: tokens.expires_in
			});
		} catch (err) {
			console.error('Token refresh failed:', err);
			// Clear invalid tokens and redirect to home
			cookies.delete('spotify_access_token', { path: '/' });
			cookies.delete('spotify_refresh_token', { path: '/' });
			throw redirect(302, '/?error=session_expired');
		}
	}

	return {};
};
