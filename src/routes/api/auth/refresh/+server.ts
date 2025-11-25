import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { refreshToken } from '$lib/spotify';
import { SPOTIFY_CLIENT_ID } from '$env/static/private';

export const POST: RequestHandler = async ({ cookies }) => {
	const refreshTokenValue = cookies.get('spotify_refresh_token');

	if (!refreshTokenValue) {
		throw error(401, 'No refresh token available');
	}

	try {
		// Get new access token using refresh token
		const tokens = await refreshToken(refreshTokenValue, SPOTIFY_CLIENT_ID);

		// Update access token cookie
		cookies.set('spotify_access_token', tokens.access_token, {
			httpOnly: true,
			secure: false, // Set to true in production
			path: '/',
			sameSite: 'lax',
			maxAge: tokens.expires_in
		});

		return json({ success: true });
	} catch (err) {
		console.error('Token refresh error:', err);

		// Clear invalid tokens
		cookies.delete('spotify_access_token', { path: '/' });
		cookies.delete('spotify_refresh_token', { path: '/' });

		throw error(401, 'Failed to refresh token');
	}
};
