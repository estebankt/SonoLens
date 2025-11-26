import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTracksByMood, getUserProfile } from '$lib/spotify';
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

		console.log('Mood Analysis:', body.mood_analysis);

		// Prepare search parameters from mood analysis
		const genres = body.mood_analysis.recommended_genres || [];
		const moodTags = body.mood_analysis.mood_tags || [];

		// Fallback genres if none provided
		const searchGenres = genres.length > 0 ? genres : ['pop', 'indie'];

		console.log('Search genres:', searchGenres);
		console.log('Mood tags:', moodTags);

		// Get user's market/country
		let userMarket: string | undefined;
		try {
			const profile = await getUserProfile(accessToken);
			if (profile.country) {
				userMarket = profile.country;
				console.log('Using user market:', profile.country);
			}
		} catch (e) {
			console.log('Could not get user market, continuing without it');
		}

		// Search for tracks using genre and mood
		const searchResults = await searchTracksByMood(accessToken, {
			genres: searchGenres,
			energy: body.mood_analysis.energy_level,
			mood: moodTags,
			limit: body.limit || 20,
			market: userMarket
		});

		if (!searchResults.tracks || searchResults.tracks.length === 0) {
			return json(
				{
					success: false,
					error: 'No tracks found for this mood. Try a different image.'
				} satisfies GeneratePlaylistResponse,
				{ status: 404 }
			);
		}

		console.log(`✓ Found ${searchResults.tracks.length} tracks`);

		return json({
			success: true,
			tracks: searchResults.tracks
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
