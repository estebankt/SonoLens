import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getUserProfile,
	refreshToken,
	getTopArtists,
	getTopTracks,
	getRecentlyPlayed
} from '$lib/spotify';
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
		// Fetch user profile, top artists, top tracks, and recently played from Spotify
		const [user, topArtists, topTracks, recentlyPlayed] = await Promise.all([
			getUserProfile(accessToken!),
			getTopArtists(accessToken!, 'medium_term', 4),
			getTopTracks(accessToken!, 'medium_term', 4),
			getRecentlyPlayed(accessToken!, 4)
		]);

		return {
			user,
			topArtists: topArtists.items,
			topTracks: topTracks.items,
			recentlyPlayed: recentlyPlayed.items
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

				// Retry getting user profile, top artists, top tracks, and recently played
				const [user, topArtists, topTracks, recentlyPlayed] = await Promise.all([
					getUserProfile(tokens.access_token),
					getTopArtists(tokens.access_token, 'medium_term', 4),
					getTopTracks(tokens.access_token, 'medium_term', 4),
					getRecentlyPlayed(tokens.access_token, 4)
				]);
				return {
					user,
					topArtists: topArtists.items,
					topTracks: topTracks.items,
					recentlyPlayed: recentlyPlayed.items
				};
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
