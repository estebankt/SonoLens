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
	scopes: string[] = [
		'user-read-email',
		'user-read-private',
		'playlist-modify-public',
		'playlist-modify-private'
	]
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
		throw new Error(
			`Failed to get tokens: ${response.status} ${response.statusText} - ${errorBody}`
		);
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
export async function getUserProfile(accessToken: string): Promise<{
	id: string;
	display_name: string;
	email: string;
	country?: string;
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

/**
 * Get user's top artists
 */
export async function getTopArtists(
	accessToken: string,
	timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
	limit: number = 10
): Promise<{
	items: Array<{
		id: string;
		name: string;
		images: { url: string; height: number; width: number }[];
		genres: string[];
		popularity: number;
		external_urls: { spotify: string };
	}>;
}> {
	const params = new URLSearchParams({
		time_range: timeRange,
		limit: limit.toString()
	});

	const response = await fetch(`${SPOTIFY_API_BASE_URL}/me/top/artists?${params.toString()}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to get top artists: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get user's top tracks
 */
export async function getTopTracks(
	accessToken: string,
	timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
	limit: number = 10
): Promise<{
	items: Array<{
		id: string;
		name: string;
		artists: Array<{ id: string; name: string }>;
		album: {
			id: string;
			name: string;
			images: { url: string; height: number; width: number }[];
		};
		duration_ms: number;
		popularity: number;
		external_urls: { spotify: string };
	}>;
}> {
	const params = new URLSearchParams({
		time_range: timeRange,
		limit: limit.toString()
	});

	const response = await fetch(`${SPOTIFY_API_BASE_URL}/me/top/tracks?${params.toString()}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to get top tracks: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get user's recently played tracks
 */
export async function getRecentlyPlayed(
	accessToken: string,
	limit: number = 10
): Promise<{
	items: Array<{
		track: {
			id: string;
			name: string;
			artists: Array<{ id: string; name: string }>;
			album: {
				id: string;
				name: string;
				images: { url: string; height: number; width: number }[];
			};
			duration_ms: number;
			external_urls: { spotify: string };
		};
		played_at: string;
	}>;
}> {
	const params = new URLSearchParams({
		limit: limit.toString()
	});

	const response = await fetch(
		`${SPOTIFY_API_BASE_URL}/me/player/recently-played?${params.toString()}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to get recently played tracks: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get track recommendations based on seed data and audio features
 */
export async function getRecommendations(
	accessToken: string,
	params: {
		seed_genres?: string[];
		seed_artists?: string[];
		seed_tracks?: string[];
		target_energy?: number; // 0.0 - 1.0
		target_valence?: number; // 0.0 - 1.0 (happiness)
		target_danceability?: number; // 0.0 - 1.0
		target_acousticness?: number; // 0.0 - 1.0
		target_instrumentalness?: number; // 0.0 - 1.0
		limit?: number; // default 20, max 100
		market?: string; // ISO 3166-1 alpha-2 country code
	}
): Promise<{
	tracks: Array<{
		id: string;
		uri: string;
		name: string;
		artists: Array<{
			id: string;
			name: string;
			uri: string;
		}>;
		album: {
			id: string;
			name: string;
			images: Array<{
				url: string;
				height: number;
				width: number;
			}>;
		};
		duration_ms: number;
		preview_url: string | null;
		external_urls: {
			spotify: string;
		};
		popularity: number;
	}>;
}> {
	// Calculate total seeds (Spotify requires at least 1, max 5 total)
	let totalSeeds = 0;
	const seedGenres: string[] = [];
	const seedArtists: string[] = [];
	const seedTracks: string[] = [];

	if (params.seed_genres && params.seed_genres.length > 0) {
		const available = 5 - totalSeeds;
		seedGenres.push(...params.seed_genres.slice(0, available));
		totalSeeds += seedGenres.length;
	}
	if (params.seed_artists && params.seed_artists.length > 0 && totalSeeds < 5) {
		const available = 5 - totalSeeds;
		seedArtists.push(...params.seed_artists.slice(0, available));
		totalSeeds += seedArtists.length;
	}
	if (params.seed_tracks && params.seed_tracks.length > 0 && totalSeeds < 5) {
		const available = 5 - totalSeeds;
		seedTracks.push(...params.seed_tracks.slice(0, available));
		totalSeeds += seedTracks.length;
	}

	// Ensure we have at least one seed
	if (totalSeeds === 0) {
		throw new Error('At least one seed (genre, artist, or track) is required for recommendations');
	}

	// Build query parameters manually (URLSearchParams encodes commas as %2C which breaks Spotify)
	const queryParts: string[] = [];

	// Add seeds (commas must NOT be encoded for Spotify)
	if (seedGenres.length > 0) {
		queryParts.push(`seed_genres=${seedGenres.join(',')}`);
	}
	if (seedArtists.length > 0) {
		queryParts.push(`seed_artists=${seedArtists.join(',')}`);
	}
	if (seedTracks.length > 0) {
		queryParts.push(`seed_tracks=${seedTracks.join(',')}`);
	}

	// Add target audio features
	if (params.target_energy !== undefined) {
		queryParts.push(`target_energy=${params.target_energy}`);
	}
	if (params.target_valence !== undefined) {
		queryParts.push(`target_valence=${params.target_valence}`);
	}
	if (params.target_danceability !== undefined) {
		queryParts.push(`target_danceability=${params.target_danceability}`);
	}
	if (params.target_acousticness !== undefined) {
		queryParts.push(`target_acousticness=${params.target_acousticness}`);
	}
	if (params.target_instrumentalness !== undefined) {
		queryParts.push(`target_instrumentalness=${params.target_instrumentalness}`);
	}

	// Set limit (default 20, max 100)
	queryParts.push(`limit=${params.limit || 20}`);

	// Add market parameter if provided (helps with availability)
	if (params.market) {
		queryParts.push(`market=${params.market}`);
	}

	const queryString = queryParts.join('&');
	const url = `${SPOTIFY_API_BASE_URL}/recommendations?${queryString}`;

	console.log('🎵 Spotify Recommendations API Call:');
	console.log('URL:', url);
	console.log('Seeds:', {
		genres: seedGenres,
		artists: seedArtists,
		tracks: seedTracks,
		total: totalSeeds
	});

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error('❌ Spotify recommendations failed:', {
			status: response.status,
			statusText: response.statusText,
			body: errorBody,
			url: url
		});
		throw new Error(`Failed to get recommendations: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Search for tracks using genre and mood parameters
 * More reliable than the deprecated recommendations endpoint
 */
export async function searchTracksByMood(
	accessToken: string,
	params: {
		genres: string[];
		energy?: 'low' | 'medium' | 'high';
		mood?: string[];
		limit?: number;
		market?: string;
	}
): Promise<{
	tracks: Array<{
		id: string;
		uri: string;
		name: string;
		artists: Array<{
			id: string;
			name: string;
			uri: string;
		}>;
		album: {
			id: string;
			name: string;
			images: Array<{
				url: string;
				height: number;
				width: number;
			}>;
		};
		duration_ms: number;
		preview_url: string | null;
		external_urls: {
			spotify: string;
		};
		popularity: number;
	}>;
}> {
	console.log('🎵 Starting Spotify Search API call...');
	console.log('Input params:', {
		genres: params.genres,
		energy: params.energy,
		mood: params.mood,
		limit: params.limit,
		market: params.market
	});

	// Build search query from genres only
	// Note: Mood tags don't work well with Spotify search, so we rely on genre filtering
	const query = params.genres
		.slice(0, 3)
		.map((g) => `genre:"${g}"`)
		.join(' OR ');

	console.log('🔍 Built search query:', query);
	console.log('ℹ️  Note: Mood tags ignored for search (not effective with Spotify API)');

	const searchParams = new URLSearchParams({
		q: query,
		type: 'track',
		limit: (params.limit || 20).toString()
	});

	if (params.market) {
		searchParams.append('market', params.market);
	}

	const url = `${SPOTIFY_API_BASE_URL}/search?${searchParams.toString()}`;
	console.log('📡 Full URL:', url);
	console.log('🔑 Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	console.log('📥 Response status:', response.status, response.statusText);

	if (!response.ok) {
		const errorBody = await response.text();
		console.error('❌ Spotify search failed:', {
			status: response.status,
			statusText: response.statusText,
			body: errorBody,
			url: url
		});
		throw new Error(`Failed to search tracks: ${response.statusText}`);
	}

	const data = await response.json();
	console.log('✅ Search successful!');
	console.log('📊 Results:', {
		totalTracks: data.tracks?.items?.length || 0,
		firstTrack: data.tracks?.items?.[0]?.name || 'N/A',
		firstArtist: data.tracks?.items?.[0]?.artists?.[0]?.name || 'N/A'
	});

	// Map search results to expected format
	return {
		tracks: (data.tracks?.items || []).map((track: any) => ({
			id: track.id,
			uri: track.uri,
			name: track.name,
			artists: track.artists.map((artist: any) => ({
				id: artist.id,
				name: artist.name,
				uri: artist.uri
			})),
			album: {
				id: track.album.id,
				name: track.album.name,
				images: track.album.images
			},
			duration_ms: track.duration_ms,
			preview_url: track.preview_url,
			external_urls: track.external_urls,
			popularity: track.popularity
		}))
	};
}

/**
 * Search for an artist by name and return their Spotify ID
 */
export async function searchArtist(
	accessToken: string,
	artistName: string
): Promise<string | null> {
	const params = new URLSearchParams({
		q: artistName,
		type: 'artist',
		limit: '1'
	});

	const response = await fetch(`${SPOTIFY_API_BASE_URL}/search?${params.toString()}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		console.error(`Failed to search for artist "${artistName}":`, response.statusText);
		return null;
	}

	const data = await response.json();
	return data.artists?.items?.[0]?.id || null;
}

/**
 * Search for a track by name and return its Spotify ID
 */
export async function searchTrack(accessToken: string, trackName: string): Promise<string | null> {
	const params = new URLSearchParams({
		q: trackName,
		type: 'track',
		limit: '1'
	});

	const response = await fetch(`${SPOTIFY_API_BASE_URL}/search?${params.toString()}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		console.error(`Failed to search for track "${trackName}":`, response.statusText);
		return null;
	}

	const data = await response.json();
	return data.tracks?.items?.[0]?.id || null;
}

/**
 * Get available genre seeds for recommendations
 */
export async function getAvailableGenreSeeds(accessToken: string): Promise<{ genres: string[] }> {
	const response = await fetch(`${SPOTIFY_API_BASE_URL}/recommendations/available-genre-seeds`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to get genre seeds: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Create a new playlist for the current user
 */
export async function createPlaylist(
	accessToken: string,
	userId: string,
	name: string,
	options?: {
		description?: string;
		public?: boolean;
	}
): Promise<{
	id: string;
	name: string;
	external_urls: { spotify: string };
	uri: string;
	snapshot_id: string;
}> {
	const response = await fetch(`${SPOTIFY_API_BASE_URL}/users/${userId}/playlists`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name,
			description: options?.description || '',
			public: options?.public ?? false
		})
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error('Create playlist failed:', {
			status: response.status,
			statusText: response.statusText,
			body: errorBody
		});
		throw new Error(`Failed to create playlist: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Add tracks to a playlist
 */
export async function addTracksToPlaylist(
	accessToken: string,
	playlistId: string,
	trackUris: string[]
): Promise<{ snapshot_id: string }> {
	const response = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			uris: trackUris
		})
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error('Add tracks to playlist failed:', {
			status: response.status,
			statusText: response.statusText,
			body: errorBody
		});
		throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
	}

	return response.json();
}
