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
 * Only returns genres that are known to be valid in Spotify
 */
function normalizeGenres(genres: string[]): string[] {
	// Known valid Spotify genre seeds (subset of most common ones)
	const validGenres = [
		'acoustic',
		'afrobeat',
		'alt-rock',
		'alternative',
		'ambient',
		'anime',
		'black-metal',
		'bluegrass',
		'blues',
		'bossanova',
		'brazil',
		'breakbeat',
		'british',
		'cantopop',
		'chicago-house',
		'children',
		'chill',
		'classical',
		'club',
		'comedy',
		'country',
		'dance',
		'dancehall',
		'death-metal',
		'deep-house',
		'detroit-techno',
		'disco',
		'disney',
		'drum-and-bass',
		'dub',
		'dubstep',
		'edm',
		'electro',
		'electronic',
		'emo',
		'folk',
		'forro',
		'french',
		'funk',
		'garage',
		'german',
		'gospel',
		'goth',
		'grindcore',
		'groove',
		'grunge',
		'guitar',
		'happy',
		'hard-rock',
		'hardcore',
		'hardstyle',
		'heavy-metal',
		'hip-hop',
		'holidays',
		'honky-tonk',
		'house',
		'idm',
		'indian',
		'indie',
		'indie-pop',
		'industrial',
		'iranian',
		'j-dance',
		'j-idol',
		'j-pop',
		'j-rock',
		'jazz',
		'k-pop',
		'kids',
		'latin',
		'latino',
		'malay',
		'mandopop',
		'metal',
		'metal-misc',
		'metalcore',
		'minimal-techno',
		'movies',
		'mpb',
		'new-age',
		'new-release',
		'opera',
		'pagode',
		'party',
		'philippines-opm',
		'piano',
		'pop',
		'pop-film',
		'post-dubstep',
		'power-pop',
		'progressive-house',
		'psych-rock',
		'punk',
		'punk-rock',
		'r-n-b',
		'rainy-day',
		'reggae',
		'reggaeton',
		'road-trip',
		'rock',
		'rock-n-roll',
		'rockabilly',
		'romance',
		'sad',
		'salsa',
		'samba',
		'sertanejo',
		'show-tunes',
		'singer-songwriter',
		'ska',
		'sleep',
		'songwriter',
		'soul',
		'soundtracks',
		'spanish',
		'study',
		'summer',
		'swedish',
		'synth-pop',
		'tango',
		'techno',
		'trance',
		'trip-hop',
		'turkish',
		'work-out',
		'world-music'
	];

	const genreMap: Record<string, string> = {
		// Common mappings to valid genres
		'hip hop': 'hip-hop',
		hiphop: 'hip-hop',
		rap: 'hip-hop',
		rnb: 'r-n-b',
		'r&b': 'r-n-b',
		alt: 'alternative',
		'alt rock': 'alt-rock',
		'indie rock': 'indie',
		'rock and roll': 'rock-n-roll'
	};

	const normalized = genres
		.map((genre) => {
			const lower = genre.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
			// Check if it's in our mapping
			if (genreMap[lower]) return genreMap[lower];
			// Check if it's already valid
			if (validGenres.includes(lower)) return lower;
			// Try without spaces (turn spaces to hyphens)
			const hyphenated = lower.replace(/\s+/g, '-');
			if (validGenres.includes(hyphenated)) return hyphenated;
			return null;
		})
		.filter((genre): genre is string => genre !== null && genre.length > 0);

	// Return up to 5 genres, or fallback to 'pop' if none are valid
	const result = normalized.slice(0, 5);
	return result.length > 0 ? result : ['pop'];
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
