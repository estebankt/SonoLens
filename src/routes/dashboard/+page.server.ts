import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserProfile, refreshToken } from '$lib/spotify';
import { SPOTIFY_CLIENT_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ cookies }) => {
	let accessToken = cookies.get('spotify_access_token');
	const refreshTokenValue = cookies.get('spotify_refresh_token');

	// Redirect to home if not authenticated
	if (!accessToken && !refreshTokenValue) {
		throw redirect(302, '/');
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

	try {
		// Fetch user profile from Spotify
		const user = await getUserProfile(accessToken!);

		return {
			user
		};
	} catch (err: any) {
		console.error('Failed to fetch user profile:', err);

		// If 401 error and we have refresh token, try refreshing once
		if (err.message?.includes('401') && refreshTokenValue) {
			try {
				const tokens = await refreshToken(refreshTokenValue, SPOTIFY_CLIENT_ID);

				// Update access token cookie
				cookies.set('spotify_access_token', tokens.access_token, {
					httpOnly: true,
					secure: false,
					path: '/',
					sameSite: 'lax',
					maxAge: tokens.expires_in
				});

				// Retry getting user profile
				const user = await getUserProfile(tokens.access_token);
				return { user };
			} catch (refreshErr) {
				console.error('Token refresh and retry failed:', refreshErr);
			}
		}

		// Clear invalid tokens and redirect to home
		cookies.delete('spotify_access_token', { path: '/' });
		cookies.delete('spotify_refresh_token', { path: '/' });
		throw redirect(302, '/?error=profile_fetch_failed');
	}
};
