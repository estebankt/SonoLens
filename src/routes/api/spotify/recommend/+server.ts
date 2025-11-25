import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecommendations } from '$lib/spotify';
import { moodToSpotifyParams } from '$lib/utils/mood-to-spotify';
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

		// Convert mood analysis to Spotify recommendation parameters
		const spotifyParams = moodToSpotifyParams(body.mood_analysis, body.limit || 20);

		console.log('Mood Analysis:', body.mood_analysis);
		console.log('Spotify Params:', spotifyParams);

		// Validate that we have at least one seed
		const hasSeeds =
			(spotifyParams.seed_genres && spotifyParams.seed_genres.length > 0) ||
			(spotifyParams.seed_artists && spotifyParams.seed_artists.length > 0) ||
			(spotifyParams.seed_tracks && spotifyParams.seed_tracks.length > 0);

		if (!hasSeeds) {
			// Fallback: use generic pop genre if no seeds found
			console.log('No seeds found, using fallback genre: pop');
			spotifyParams.seed_genres = ['pop'];
		}

		console.log('Final Spotify Params:', spotifyParams);

		// Get recommendations from Spotify
		const recommendations = await getRecommendations(accessToken, spotifyParams);

		if (!recommendations.tracks || recommendations.tracks.length === 0) {
			return json(
				{
					success: false,
					error: 'No recommendations found for this mood. Try a different image or mood.'
				} satisfies GeneratePlaylistResponse,
				{ status: 404 }
			);
		}

		return json({
			success: true,
			tracks: recommendations.tracks
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
