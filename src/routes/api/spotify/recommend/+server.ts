import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTrackFull, processBatches } from '$lib/spotify';
import type {
	GeneratePlaylistRequest,
	GeneratePlaylistResponse,
	SpotifyTrack
} from '$lib/types/phase2';
import { DEMO_TRACKS } from '$lib/demo-data';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Demo mode: return curated mock tracks
		const isDemoMode = cookies.get('demo_mode') === 'true';
		if (isDemoMode) {
			return json({ success: true, tracks: DEMO_TRACKS } satisfies GeneratePlaylistResponse);
		}

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
		console.log('Searching for tracks on Spotify in parallel batches...');
		console.log('───────────────────────────────────────────────────');

		// Configuration: Process tracks in parallel batches of 5 for optimal performance
		const BATCH_SIZE = 5;
		const limit = body.limit || 20;

		// Limit track list to requested number before searching
		const tracksToSearch = suggestedTracks.slice(0, limit);

		// Search for tracks in parallel batches (much faster than sequential)
		const tracks = await processBatches(tracksToSearch, BATCH_SIZE, async (trackName) => {
			console.log(`🔍 Searching: "${trackName}"`);
			return await searchTrackFull(accessToken, trackName);
		});

		// Filter out null results (tracks not found) and extract valid tracks
		const foundTracks = tracks.filter((track): track is SpotifyTrack => track !== null);
		const notFound = tracksToSearch.filter(
			(name) => !foundTracks.some((track) => track.name.toLowerCase().includes(name.toLowerCase()))
		);

		// Log results with preview availability
		foundTracks.forEach((track) => {
			const hasPreview = !!track.preview_url;
			console.log(
				`  ✓ Found: "${track.name}" by ${track.artists.map((a) => a.name).join(', ')}${hasPreview ? ' [Preview ✓]' : ' [No Preview ✗]'}`
			);
		});

		notFound.forEach((trackName) => {
			console.log(`  ✗ Not found: "${trackName}"`);
		});

		const tracksWithPreview = foundTracks.filter((t) => t.preview_url).length;
		const tracksWithoutPreview = foundTracks.length - tracksWithPreview;

		console.log('═══════════════════════════════════════════════════');
		console.log(`✅ SUCCESS: Found ${foundTracks.length} tracks on Spotify`);
		console.log(
			`🎵 Preview availability: ${tracksWithPreview} have previews, ${tracksWithoutPreview} don't`
		);
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
