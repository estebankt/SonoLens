import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getRecommendations,
	searchArtist,
	searchTrack,
	getUserProfile,
	getAvailableGenreSeeds
} from '$lib/spotify';
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
		console.log('Initial Spotify Params:', spotifyParams);

		// STEP 1: Validate genres against Spotify's official list
		console.log('🔍 Fetching official Spotify genre seeds...');
		let validGenres: string[] = [];
		try {
			const genreData = await getAvailableGenreSeeds(accessToken);
			const spotifyGenres = genreData.genres;
			console.log(`✓ Fetched ${spotifyGenres.length} valid Spotify genres`);

			// Filter AI-provided genres to only valid ones
			if (spotifyParams.seed_genres && spotifyParams.seed_genres.length > 0) {
				validGenres = spotifyParams.seed_genres.filter((genre) =>
					spotifyGenres.includes(genre.toLowerCase())
				);
				console.log('Valid genres from AI:', validGenres);
				console.log(
					'Invalid genres filtered out:',
					spotifyParams.seed_genres.filter((g) => !validGenres.includes(g))
				);
			}

			// Fallback if no valid genres
			if (validGenres.length === 0) {
				console.log('⚠️ No valid genres found, using fallback: ambient');
				validGenres = ['ambient'];
			}

			spotifyParams.seed_genres = validGenres.slice(0, 3); // Max 3 genres to leave room for artists/tracks
		} catch (e) {
			console.error('Failed to fetch genre seeds, using fallback:', e);
			spotifyParams.seed_genres = ['ambient', 'pop'];
		}

		// STEP 2: Convert artist names to Spotify IDs (if AI provided any)
		let artistIds: string[] = [];
		if (spotifyParams.seed_artists && spotifyParams.seed_artists.length > 0) {
			console.log('🔍 Converting artist names to IDs...');
			for (const artistName of spotifyParams.seed_artists) {
				const artistId = await searchArtist(accessToken, artistName);
				if (artistId) {
					console.log(`✓ Found artist: "${artistName}" -> ${artistId}`);
					artistIds.push(artistId);
				} else {
					console.log(`✗ Could not find artist: "${artistName}"`);
				}
			}
		}

		// STEP 3: Add fallback artists if none provided or found
		if (artistIds.length === 0) {
			console.log('⚠️ No artists provided, adding fallback artists');
			// Fallback artists: Brian Eno (ambient), Nils Frahm (modern classical)
			artistIds = ['7MSUfLeTdDEoZiJPDSBXgi', '5hW4u5RbOqEte58YvgVIZ1'];
		}
		spotifyParams.seed_artists = artistIds.slice(0, 2); // Max 2 artists

		// STEP 4: Convert track names to Spotify IDs (if AI provided any)
		let trackIds: string[] = [];
		if (spotifyParams.seed_tracks && spotifyParams.seed_tracks.length > 0) {
			console.log('🔍 Converting track names to IDs...');
			for (const trackName of spotifyParams.seed_tracks) {
				const trackId = await searchTrack(accessToken, trackName);
				if (trackId) {
					console.log(`✓ Found track: "${trackName}" -> ${trackId}`);
					trackIds.push(trackId);
				} else {
					console.log(`✗ Could not find track: "${trackName}"`);
				}
			}
		}

		// No fallback tracks needed - we have genres + artists
		spotifyParams.seed_tracks = trackIds.slice(0, 1); // Max 1 track

		// STEP 5: Ensure we have 1-5 seeds total
		const totalSeeds =
			(spotifyParams.seed_genres?.length || 0) +
			(spotifyParams.seed_artists?.length || 0) +
			(spotifyParams.seed_tracks?.length || 0);

		console.log('📊 Final seed distribution:', {
			genres: spotifyParams.seed_genres?.length || 0,
			artists: spotifyParams.seed_artists?.length || 0,
			tracks: spotifyParams.seed_tracks?.length || 0,
			total: totalSeeds
		});

		if (totalSeeds === 0 || totalSeeds > 5) {
			throw new Error(`Invalid seed count: ${totalSeeds}. Must be between 1-5.`);
		}

		console.log('✅ Validated Spotify Params:', spotifyParams);

		// Get user's market/country for recommendations
		try {
			const profile = await getUserProfile(accessToken);
			if (profile.country) {
				(spotifyParams as any).market = profile.country;
				console.log('Using user market:', profile.country);
			}
		} catch (e) {
			console.log('Could not get user market, continuing without it');
		}

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
