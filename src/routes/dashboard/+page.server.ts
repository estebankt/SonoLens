import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserProfile } from '$lib/spotify';

export const load: PageServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get('spotify_access_token');

	// Redirect to home if not authenticated
	if (!accessToken) {
		throw redirect(302, '/');
	}

	try {
		// Fetch user profile from Spotify
		const user = await getUserProfile(accessToken);

		return {
			user
		};
	} catch (err) {
		console.error('Failed to fetch user profile:', err);
		// Clear invalid token and redirect to home
		cookies.delete('spotify_access_token', { path: '/' });
		cookies.delete('spotify_refresh_token', { path: '/' });
		throw redirect(302, '/?error=profile_fetch_failed');
	}
};
