import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokensFromSpotify } from '$lib/spotify';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '$env/static/private';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	// Handle authorization errors
	if (error) {
		console.error('Spotify authorization error:', error);
		throw redirect(302, '/?error=' + error);
	}

	if (!code) {
		throw redirect(302, '/?error=no_code');
	}

	// Retrieve code_verifier from cookie
	const codeVerifier = cookies.get('spotify_code_verifier');

	if (!codeVerifier) {
		throw redirect(302, '/?error=no_verifier');
	}

	try {
		// Exchange code for tokens
		const tokens = await getTokensFromSpotify(
			code,
			codeVerifier,
			SPOTIFY_CLIENT_ID,
			SPOTIFY_REDIRECT_URI
		);

		// Store tokens in secure cookies
		cookies.set('spotify_access_token', tokens.access_token, {
			httpOnly: true,
			secure: false, // Set to true in production
			path: '/',
			sameSite: 'lax',
			maxAge: tokens.expires_in
		});

		cookies.set('spotify_refresh_token', tokens.refresh_token, {
			httpOnly: true,
			secure: false, // Set to true in production
			path: '/',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		// Clear the code_verifier cookie
		cookies.delete('spotify_code_verifier', { path: '/' });

		// Redirect to dashboard
		throw redirect(302, '/dashboard');
	} catch (err) {
		console.error('Token exchange error:', err);
		throw redirect(302, '/?error=token_exchange_failed');
	}
};
