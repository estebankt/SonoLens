import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecommendations } from '$lib/spotify';
import type { MoodAnalysis, SpotifyTrack } from '$lib/types/phase2';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { track, mood_analysis, limit = 5 } = await request.json();

		if (!track || !mood_analysis) {
			throw error(400, 'Missing track or mood_analysis in request');
		}

		// Get access token from cookie
		const accessToken = cookies.get('spotify_access_token');
		if (!accessToken) {
			throw error(401, 'Not authenticated with Spotify');
		}

		console.log('🔄 FINDING REPLACEMENT TRACKS');
		console.log('Track to replace:', track.name, 'by', track.artists[0].name);
		console.log('Mood context:', mood_analysis.atmosphere);

		// Extract genres from mood analysis
		const genres = mood_analysis.suggested_genres || [];

		// Build recommendation parameters based on mood and the track being replaced
		const params: {
			seed_genres?: string[];
			seed_artists?: string[];
			seed_tracks?: string[];
			target_energy?: number;
			target_valence?: number;
			target_danceability?: number;
			target_acousticness?: number;
			limit?: number;
		} = {
			limit: limit * 2 // Get more to filter out the original track
		};

		// Use the track being replaced as a seed to find similar tracks
		params.seed_tracks = [track.id];

		// Add genre seeds if available (up to 2 genres + 1 track = 3 seeds total)
		if (genres.length > 0) {
			params.seed_genres = genres.slice(0, 2);
		}

		// Map mood energy to Spotify parameters
		const moodAnalysis = mood_analysis as MoodAnalysis;
		if (moodAnalysis.energy_level === 'high') {
			params.target_energy = 0.8;
			params.target_valence = 0.7;
		} else if (moodAnalysis.energy_level === 'medium') {
			params.target_energy = 0.5;
			params.target_valence = 0.5;
		} else {
			params.target_energy = 0.3;
			params.target_valence = 0.3;
		}

		// Get recommendations
		const recommendations = await getRecommendations(accessToken, params);

		// Filter out the original track being replaced
		let suggestions = recommendations.tracks.filter((t) => t.id !== track.id);

		// Limit to requested number
		suggestions = suggestions.slice(0, limit);

		console.log(`✅ Found ${suggestions.length} replacement suggestions`);

		return json({
			success: true,
			suggestions,
			original_track: track
		});
	} catch (err) {
		console.error('Error getting replacement suggestions:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		return json(
			{
				success: false,
				error: err instanceof Error ? err.message : 'Failed to get replacement suggestions'
			},
			{ status: 500 }
		);
	}
};
