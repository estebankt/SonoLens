import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DEMO_TRACKS } from '$lib/demo-data';

export const GET: RequestHandler = async ({ url, cookies }) => {
	// Get search query from URL params
	const query = url.searchParams.get('q');

	// Validate query
	if (!query || query.trim().length === 0) {
		return json({ success: false, error: 'Search query required' }, { status: 400 });
	}

	// Demo mode: search in mock tracks
	const isDemoMode = cookies.get('demo_mode') === 'true';
	if (isDemoMode) {
		const searchResults = DEMO_TRACKS.filter(
			(track) =>
				track.name.toLowerCase().includes(query.toLowerCase()) ||
				track.artists.some((a) => a.name.toLowerCase().includes(query.toLowerCase()))
		).slice(0, 10);

		return json({ success: true, tracks: searchResults });
	}

	// Get access token from cookies
	const accessToken = cookies.get('spotify_access_token');
	if (!accessToken) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		// Call Spotify Search API
		const response = await fetch(
			`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
			{
				headers: { Authorization: `Bearer ${accessToken}` }
			}
		);

		if (!response.ok) {
			if (response.status === 401) {
				return json({ success: false, error: 'Authentication expired' }, { status: 401 });
			}
			throw new Error(`Spotify API returned ${response.status}`);
		}

		const data = await response.json();

		// Transform to SpotifyTrack format
		const tracks = data.tracks.items.map((item: any) => ({
			id: item.id,
			uri: item.uri,
			name: item.name,
			artists: item.artists.map((a: any) => ({
				id: a.id,
				name: a.name,
				uri: a.uri
			})),
			album: {
				id: item.album.id,
				name: item.album.name,
				images: item.album.images
			},
			duration_ms: item.duration_ms,
			preview_url: item.preview_url,
			external_urls: item.external_urls,
			popularity: item.popularity
		}));

		return json({ success: true, tracks });
	} catch (error) {
		console.error('Spotify search error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Search failed'
			},
			{ status: 500 }
		);
	}
};
