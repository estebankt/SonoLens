/**
 * Spotify API helper functions for OAuth and user data
 */

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Generate a random string for PKCE code_verifier
 */
export function generateCodeVerifier(length: number = 128): string {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	const values = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(values)
		.map((x) => possible[x % possible.length])
		.join('');
}

/**
 * Generate code_challenge from code_verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

/**
 * Build Spotify authorization URL
 */
export function getAuthorizationUrl(
	clientId: string,
	redirectUri: string,
	codeChallenge: string,
	scopes: string[] = ['user-read-email', 'user-read-private']
): string {
	const params = new URLSearchParams({
		client_id: clientId,
		response_type: 'code',
		redirect_uri: redirectUri,
		code_challenge_method: 'S256',
		code_challenge: codeChallenge,
		scope: scopes.join(' ')
	});

	return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getTokensFromSpotify(
	code: string,
	codeVerifier: string,
	clientId: string,
	redirectUri: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
	const response = await fetch(SPOTIFY_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: clientId,
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri,
			code_verifier: codeVerifier
		})
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error('Spotify token exchange failed:', {
			status: response.status,
			statusText: response.statusText,
			body: errorBody
		});
		throw new Error(`Failed to get tokens: ${response.status} ${response.statusText} - ${errorBody}`);
	}

	return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
	refreshToken: string,
	clientId: string
): Promise<{ access_token: string; expires_in: number }> {
	const response = await fetch(SPOTIFY_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: clientId,
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to refresh token: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get current user's Spotify profile
 */
export async function getUserProfile(
	accessToken: string
): Promise<{
	id: string;
	display_name: string;
	email: string;
	images: { url: string }[];
}> {
	const response = await fetch(`${SPOTIFY_API_BASE_URL}/me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to get user profile: ${response.statusText}`);
	}

	return response.json();
}
