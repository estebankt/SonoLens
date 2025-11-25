/**
 * Utility to map AI mood analysis to Spotify recommendation parameters
 */

import type { MoodAnalysis } from '$lib/types/phase2';

/**
 * Map energy level to Spotify energy parameter (0.0 - 1.0)
 */
function mapEnergyLevel(energyLevel: 'low' | 'medium' | 'high'): number {
	const energyMap = {
		low: 0.3,
		medium: 0.6,
		high: 0.9
	};
	return energyMap[energyLevel];
}

/**
 * Infer valence (happiness) from mood tags and emotional descriptors
 * Returns a value between 0.0 (sad) and 1.0 (happy)
 */
function inferValence(moodTags: string[], emotionalDescriptors: string[]): number {
	const allDescriptors = [...moodTags, ...emotionalDescriptors].map((d) => d.toLowerCase());

	// Positive mood indicators
	const positiveKeywords = [
		'happy',
		'joyful',
		'uplifting',
		'cheerful',
		'energetic',
		'excited',
		'optimistic',
		'bright',
		'playful',
		'euphoric'
	];

	// Negative mood indicators
	const negativeKeywords = [
		'sad',
		'melancholic',
		'somber',
		'dark',
		'gloomy',
		'depressing',
		'lonely',
		'nostalgic',
		'moody',
		'tragic'
	];

	let positiveCount = 0;
	let negativeCount = 0;

	allDescriptors.forEach((descriptor) => {
		if (positiveKeywords.some((keyword) => descriptor.includes(keyword))) {
			positiveCount++;
		}
		if (negativeKeywords.some((keyword) => descriptor.includes(keyword))) {
			negativeCount++;
		}
	});

	// Calculate valence based on positive/negative ratio
	const total = positiveCount + negativeCount;
	if (total === 0) return 0.5; // Neutral if no clear indicators

	return positiveCount / total;
}

/**
 * Infer danceability from mood and energy
 */
function inferDanceability(
	moodTags: string[],
	energyLevel: 'low' | 'medium' | 'high'
): number {
	const allTags = moodTags.map((t) => t.toLowerCase());

	const danceKeywords = [
		'dance',
		'groove',
		'rhythmic',
		'upbeat',
		'funky',
		'party',
		'energetic',
		'lively'
	];

	const hasDanceKeywords = allTags.some((tag) =>
		danceKeywords.some((keyword) => tag.includes(keyword))
	);

	if (hasDanceKeywords) {
		return 0.8;
	}

	// Base danceability on energy level
	const energyToDance = {
		low: 0.3,
		medium: 0.5,
		high: 0.7
	};

	return energyToDance[energyLevel];
}

/**
 * Infer acousticness from mood tags
 */
function inferAcousticness(moodTags: string[]): number | undefined {
	const allTags = moodTags.map((t) => t.toLowerCase());

	const acousticKeywords = [
		'acoustic',
		'organic',
		'natural',
		'folk',
		'intimate',
		'stripped',
		'raw'
	];
	const electronicKeywords = ['electronic', 'synthetic', 'digital', 'techno', 'edm'];

	const isAcoustic = allTags.some((tag) =>
		acousticKeywords.some((keyword) => tag.includes(keyword))
	);
	const isElectronic = allTags.some((tag) =>
		electronicKeywords.some((keyword) => tag.includes(keyword))
	);

	if (isAcoustic) return 0.8;
	if (isElectronic) return 0.2;

	return undefined; // Let Spotify decide
}

/**
 * Infer instrumentalness from mood tags
 */
function inferInstrumentalness(moodTags: string[]): number | undefined {
	const allTags = moodTags.map((t) => t.toLowerCase());

	const instrumentalKeywords = ['instrumental', 'ambient', 'cinematic', 'atmospheric', 'soundscape'];

	const isInstrumental = allTags.some((tag) =>
		instrumentalKeywords.some((keyword) => tag.includes(keyword))
	);

	if (isInstrumental) return 0.7;

	return undefined; // Let Spotify decide
}

/**
 * Normalize genre names to match Spotify's available genre seeds
 * This is a simplified mapping - in production, you'd fetch available genres
 * and do fuzzy matching
 */
function normalizeGenres(genres: string[]): string[] {
	const genreMap: Record<string, string> = {
		// Common mappings
		hiphop: 'hip-hop',
		'hip hop': 'hip-hop',
		rap: 'hip-hop',
		rnb: 'r-n-b',
		'r&b': 'r-n-b',
		edm: 'dance',
		electronic: 'electronic',
		indie: 'indie',
		alternative: 'alt-rock',
		metal: 'metal',
		jazz: 'jazz',
		blues: 'blues',
		classical: 'classical',
		country: 'country',
		folk: 'folk',
		reggae: 'reggae',
		latin: 'latin',
		soul: 'soul',
		funk: 'funk',
		disco: 'disco',
		house: 'house',
		techno: 'techno',
		ambient: 'ambient',
		rock: 'rock',
		pop: 'pop',
		punk: 'punk'
	};

	return genres
		.map((genre) => {
			const normalized = genre.toLowerCase().replace(/[^a-z0-9\s-]/g, '');
			return genreMap[normalized] || normalized;
		})
		.filter((genre) => genre.length > 0)
		.slice(0, 5); // Max 5 genres
}

/**
 * Convert MoodAnalysis to Spotify recommendation parameters
 */
export function moodToSpotifyParams(
	moodAnalysis: MoodAnalysis,
	limit: number = 20
): {
	seed_genres?: string[];
	seed_artists?: string[];
	seed_tracks?: string[];
	target_energy?: number;
	target_valence?: number;
	target_danceability?: number;
	target_acousticness?: number;
	target_instrumentalness?: number;
	limit: number;
} {
	const params: any = {
		limit
	};

	// Map recommended genres
	if (moodAnalysis.recommended_genres && moodAnalysis.recommended_genres.length > 0) {
		params.seed_genres = normalizeGenres(moodAnalysis.recommended_genres);
	}

	// Add seed artists if provided
	if (moodAnalysis.seed_artists && moodAnalysis.seed_artists.length > 0) {
		params.seed_artists = moodAnalysis.seed_artists.slice(0, 5);
	}

	// Add seed tracks if provided
	if (moodAnalysis.seed_tracks && moodAnalysis.seed_tracks.length > 0) {
		params.seed_tracks = moodAnalysis.seed_tracks.slice(0, 5);
	}

	// Map energy level
	params.target_energy = mapEnergyLevel(moodAnalysis.energy_level);

	// Infer valence from mood tags and emotional descriptors
	params.target_valence = inferValence(
		moodAnalysis.mood_tags,
		moodAnalysis.emotional_descriptors || []
	);

	// Infer danceability
	params.target_danceability = inferDanceability(moodAnalysis.mood_tags, moodAnalysis.energy_level);

	// Infer acousticness (optional)
	const acousticness = inferAcousticness(moodAnalysis.mood_tags);
	if (acousticness !== undefined) {
		params.target_acousticness = acousticness;
	}

	// Infer instrumentalness (optional)
	const instrumentalness = inferInstrumentalness(moodAnalysis.mood_tags);
	if (instrumentalness !== undefined) {
		params.target_instrumentalness = instrumentalness;
	}

	return params;
}
