import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTrack } from '$lib/spotify';
import type { GeneratePlaylistRequest, GeneratePlaylistResponse } from '$lib/types/phase2';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Check if user is authenticated
		const accessToken = cookies.get('spotify_access_token');
		if (!accessToken) {
			return json(
				{
					success: false,
					error: 'Unauthorized: Please log in to use this feature'
				} satisfies GeneratePlaylistResponse,
				{ status: 401 }
			);
		}

		// Parse request body
		const body = (await request.json()) as GeneratePlaylistRequest;

		if (!body.mood_analysis) {
			return json(
				{
					success: false,
					error: 'Missing required field: mood_analysis'
				} satisfies GeneratePlaylistResponse,
				{ status: 400 }
			);
		}

		console.log('═══════════════════════════════════════════════════');
		console.log('🎨 MOOD ANALYSIS RECEIVED:');
		console.log('═══════════════════════════════════════════════════');
		console.log(JSON.stringify(body.mood_analysis, null, 2));

		// Get track suggestions from AI
		const suggestedTracks = body.mood_analysis.seed_tracks || [];

		if (suggestedTracks.length === 0) {
			console.log('❌ No track suggestions from AI');
			return json(
				{
					success: false,
					error: 'AI did not suggest any tracks. Please try again.'
				} satisfies GeneratePlaylistResponse,
				{ status: 400 }
			);
		}

		console.log('───────────────────────────────────────────────────');
		console.log(`🎵 AI suggested ${suggestedTracks.length} tracks`);
		console.log('Searching for these tracks on Spotify...');
		console.log('───────────────────────────────────────────────────');

		// Search for each track on Spotify to get full track objects
		const foundTracks: any[] = [];
		const notFound: string[] = [];

		for (const trackName of suggestedTracks) {
			console.log(`🔍 Searching: "${trackName}"`);
			const trackId = await searchTrack(accessToken, trackName);

			if (trackId) {
				// Get full track details
				const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
					headers: { Authorization: `Bearer ${accessToken}` }
				});

				if (response.ok) {
					const trackData = await response.json();
					foundTracks.push({
						id: trackData.id,
						uri: trackData.uri,
						name: trackData.name,
						artists: trackData.artists.map((a: any) => ({
							id: a.id,
							name: a.name,
							uri: a.uri
						})),
						album: {
							id: trackData.album.id,
							name: trackData.album.name,
							images: trackData.album.images
						},
						duration_ms: trackData.duration_ms,
						preview_url: trackData.preview_url,
						external_urls: trackData.external_urls,
						popularity: trackData.popularity
					});
					console.log(
						`  ✓ Found: "${trackData.name}" by ${trackData.artists.map((a: any) => a.name).join(', ')}`
					);
				}
			} else {
				notFound.push(trackName);
				console.log(`  ✗ Not found: "${trackName}"`);
			}

			// Limit to requested number
			if (foundTracks.length >= (body.limit || 20)) {
				break;
			}
		}

		console.log('═══════════════════════════════════════════════════');
		console.log(`✅ SUCCESS: Found ${foundTracks.length} tracks on Spotify`);
		if (notFound.length > 0) {
			console.log(`⚠️  Could not find ${notFound.length} tracks:`, notFound.slice(0, 3));
		}
		console.log('═══════════════════════════════════════════════════');

		if (foundTracks.length === 0) {
			return json(
				{
					success: false,
					error: 'Could not find any of the suggested tracks on Spotify.'
				} satisfies GeneratePlaylistResponse,
				{ status: 404 }
			);
		}

		return json({
			success: true,
			tracks: foundTracks
		} satisfies GeneratePlaylistResponse);
	} catch (error) {
		console.error('Error in recommend endpoint:', error);

		return json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'An unexpected error occurred while generating recommendations'
			} satisfies GeneratePlaylistResponse,
			{ status: 500 }
		);
	}
};
