import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const isDemoMode = cookies.get('demo_mode') === 'true';
	const accessToken = cookies.get('spotify_access_token');
	const refreshToken = cookies.get('spotify_refresh_token');

	if (isDemoMode) {
		return json({ authenticated: true, isDemo: true });
	}

	if (accessToken) {
		return json({ authenticated: true, accessToken });
	}

	if (refreshToken) {
		// TODO: Refresh the token here if needed
		return json({ authenticated: true });
	}

	return json({ authenticated: false }, { status: 401 });
};
