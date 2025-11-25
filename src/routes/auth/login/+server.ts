import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateCodeVerifier, generateCodeChallenge, getAuthorizationUrl } from '$lib/spotify';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '$env/static/private';

export const GET: RequestHandler = async ({ cookies }) => {
	// Generate PKCE parameters
	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);

	// Store code_verifier in a secure cookie
	cookies.set('spotify_code_verifier', codeVerifier, {
		httpOnly: true,
		secure: false, // Set to true in production
		path: '/',
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Build authorization URL with required scopes and redirect
	const authUrl = getAuthorizationUrl(
		SPOTIFY_CLIENT_ID,
		SPOTIFY_REDIRECT_URI,
		codeChallenge,
		[
			'user-read-email',
			'user-read-private',
			'user-top-read',
			'user-read-recently-played',
			'playlist-modify-public',
			'playlist-modify-private'
		]
	);

	throw redirect(302, authUrl);
};
