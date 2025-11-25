import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear all auth cookies
	cookies.delete('spotify_access_token', { path: '/' });
	cookies.delete('spotify_refresh_token', { path: '/' });
	cookies.delete('spotify_code_verifier', { path: '/' });

	// Redirect to home
	throw redirect(302, '/');
};
