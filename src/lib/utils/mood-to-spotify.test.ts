import { describe, it, expect } from 'vitest';
import { moodToSpotifyParams } from './mood-to-spotify';
import type { MoodAnalysis } from '$lib/types/phase2';

// Helper to create test MoodAnalysis objects with required fields
const createMoodAnalysis = (overrides: Partial<MoodAnalysis>): MoodAnalysis => ({
	mood_tags: [],
	energy_level: 'medium',
	emotional_descriptors: [],
	atmosphere: '',
	recommended_genres: [],
	suggested_playlist_title: 'Test',
	...overrides
});

describe('Mood to Spotify Parameters', () => {
	describe('moodToSpotifyParams', () => {
		describe('Energy Level Mapping', () => {
			it('should map low energy to 0.3', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['calm'],
					energy_level: 'low',
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_energy).toBe(0.3);
			});

			it('should map medium energy to 0.6', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['moderate'],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_energy).toBe(0.6);
			});

			it('should map high energy to 0.9', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['energetic'],
					energy_level: 'high',
					recommended_genres: ['rock'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_energy).toBe(0.9);
			});
		});

		describe('Valence (Happiness) Inference', () => {
			it('should return 0.5 for neutral mood (no keywords)', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['neutral', 'moderate'],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_valence).toBe(0.5);
			});

			it('should return 1.0 for all positive keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['happy', 'joyful'],
					energy_level: 'high',
					emotional_descriptors: ['cheerful', 'uplifting'],
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Happy'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_valence).toBe(1.0);
			});

			it('should return 0.0 for all negative keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['sad', 'melancholic'],
					energy_level: 'low',
					emotional_descriptors: ['depressing', 'gloomy'],
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Sad'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_valence).toBe(0.0);
			});

			it('should calculate ratio for mixed positive/negative keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['happy', 'sad'],
					energy_level: 'medium',
					emotional_descriptors: ['melancholic'],
					recommended_genres: ['indie'],
					suggested_playlist_title: 'Mixed'
				});
				const params = moodToSpotifyParams(mood);
				// 1 positive, 2 negative = 1/3 = 0.333...
				expect(params.target_valence).toBeCloseTo(0.333, 2);
			});

			it('should be case-insensitive', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['HAPPY', 'JoYfUl'],
					energy_level: 'high',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_valence).toBe(1.0);
			});

			it('should combine mood_tags and emotional_descriptors', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['happy'],
					energy_level: 'high',
					emotional_descriptors: ['sad', 'melancholic'],
					recommended_genres: ['indie'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				// 1 positive, 2 negative = 1/3
				expect(params.target_valence).toBeCloseTo(0.333, 2);
			});
		});

		describe('Danceability Inference', () => {
			it('should return 0.8 when dance keywords present', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['dance', 'rhythmic'],
					energy_level: 'medium',
					recommended_genres: ['dance'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.8);
			});

			it('should return 0.3 for low energy without dance keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['calm'],
					energy_level: 'low',
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.3);
			});

			it('should return 0.5 for medium energy without dance keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['moderate'],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.5);
			});

			it('should return 0.7 for high energy without dance keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['intense'],
					energy_level: 'high',
					recommended_genres: ['rock'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.7);
			});

			it('should detect "energetic" as dance keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['energetic'],
					energy_level: 'low',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.8);
			});

			it('should detect "upbeat" as dance keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['upbeat'],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.8);
			});

			it('should be case-insensitive for dance keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['DANCE', 'RhYtHmIc'],
					energy_level: 'medium',
					recommended_genres: ['edm'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_danceability).toBe(0.8);
			});
		});

		describe('Acousticness Inference', () => {
			it('should return 0.8 for acoustic keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['acoustic', 'organic'],
					energy_level: 'medium',
					recommended_genres: ['folk'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_acousticness).toBe(0.8);
			});

			it('should return 0.2 for electronic keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['electronic', 'synthetic'],
					energy_level: 'high',
					recommended_genres: ['edm'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_acousticness).toBe(0.2);
			});

			it('should be undefined for neutral tags', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['calm', 'peaceful'],
					energy_level: 'low',
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_acousticness).toBeUndefined();
			});

			it('should prioritize acoustic over electronic if both present', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['acoustic', 'electronic'],
					energy_level: 'medium',
					recommended_genres: ['indie'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_acousticness).toBe(0.8);
			});

			it('should detect "natural" as acoustic keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['natural'],
					energy_level: 'low',
					recommended_genres: ['folk'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_acousticness).toBe(0.8);
			});

			it('should detect "techno" as electronic keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['techno'],
					energy_level: 'high',
					recommended_genres: ['techno'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_acousticness).toBe(0.2);
			});
		});

		describe('Instrumentalness Inference', () => {
			it('should return 0.7 for instrumental keywords', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['instrumental', 'ambient'],
					energy_level: 'low',
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_instrumentalness).toBe(0.7);
			});

			it('should be undefined for non-instrumental moods', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['vocal', 'lyrical'],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_instrumentalness).toBeUndefined();
			});

			it('should detect "cinematic" as instrumental keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['cinematic'],
					energy_level: 'medium',
					recommended_genres: ['soundtracks'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_instrumentalness).toBe(0.7);
			});

			it('should detect "atmospheric" as instrumental keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['atmospheric'],
					energy_level: 'low',
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_instrumentalness).toBe(0.7);
			});

			it('should detect "soundscape" as instrumental keyword', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['soundscape'],
					energy_level: 'low',
					recommended_genres: ['ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.target_instrumentalness).toBe(0.7);
			});
		});

		describe('Genre Normalization', () => {
			it('should return valid Spotify genres for exact matches', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie', 'ambient', 'pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toEqual(['indie', 'ambient', 'pop']);
			});

			it('should map "hip hop" to "hip-hop"', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'high',
					recommended_genres: ['hip hop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toContain('hip-hop');
			});

			it('should map "rnb" to "r-n-b"', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['rnb'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toContain('r-n-b');
			});

			it('should map "alt rock" to "alt-rock"', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'high',
					recommended_genres: ['alt rock'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toContain('alt-rock');
			});

			it('should convert spaces to hyphens', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toContain('indie-pop');
			});

			it('should filter out invalid genres', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie', 'invalid-genre-xyz', 'ambient'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toEqual(['indie', 'ambient']);
			});

			it('should return "pop" fallback when no valid genres', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['invalid1', 'invalid2'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toEqual(['pop']);
			});

			it('should limit to max 5 genres', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie', 'ambient', 'pop', 'rock', 'jazz', 'classical', 'blues'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toHaveLength(5);
			});

			it('should handle mixed case input', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['INDIE', 'AmBiEnT', 'pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toEqual(['indie', 'ambient', 'pop']);
			});

			it('should remove special characters', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie!', 'ambient@', 'pop#'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_genres).toEqual(['indie', 'ambient', 'pop']);
			});

			it('should not set seed_genres when recommended_genres is empty', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: [],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				// When recommended_genres is empty, seed_genres is not set
				expect(params.seed_genres).toBeUndefined();
			});
		});

		describe('Seed Tracks', () => {
			it('should include seed_tracks when provided', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie'],
					seed_tracks: ['Holocene - Bon Iver', 'Nude - Radiohead'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_tracks).toEqual(['Holocene - Bon Iver', 'Nude - Radiohead']);
			});

			it('should limit seed_tracks to max 5', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie'],
					seed_tracks: ['Track 1', 'Track 2', 'Track 3', 'Track 4', 'Track 5', 'Track 6'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_tracks).toHaveLength(5);
			});

			it('should not include seed_tracks when empty', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie'],
					seed_tracks: [],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_tracks).toBeUndefined();
			});

			it('should not include seed_tracks when undefined', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['indie'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.seed_tracks).toBeUndefined();
			});
		});

		describe('Limit Parameter', () => {
			it('should use default limit of 20', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);
				expect(params.limit).toBe(20);
			});

			it('should respect custom limit parameter', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood, 50);
				expect(params.limit).toBe(50);
			});
		});

		describe('Integration - Full MoodAnalysis', () => {
			it('should handle complete MoodAnalysis with all fields', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['happy', 'energetic', 'dance'],
					energy_level: 'high',
					emotional_descriptors: ['joyful', 'uplifting'],
					atmosphere: 'A vibrant party scene',
					recommended_genres: ['pop', 'dance', 'edm'],
					seed_tracks: ["Don't Stop Me Now - Queen"],
					suggested_playlist_title: 'Party Time',
					confidence_score: 0.95
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_energy).toBe(0.9);
				expect(params.target_valence).toBe(1.0);
				expect(params.target_danceability).toBe(0.8);
				expect(params.seed_genres).toEqual(['pop', 'dance', 'edm']);
				expect(params.seed_tracks).toEqual(["Don't Stop Me Now - Queen"]);
				expect(params.limit).toBe(20);
			});

			it('should handle MoodAnalysis with valid genres', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Minimal'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_energy).toBe(0.6);
				expect(params.target_valence).toBe(0.5);
				expect(params.target_danceability).toBe(0.5);
				expect(params.seed_genres).toEqual(['pop']);
				expect(params.target_acousticness).toBeUndefined();
				expect(params.target_instrumentalness).toBeUndefined();
			});

			it('should handle acoustic indie mood', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['melancholic', 'acoustic', 'instrumental'],
					energy_level: 'low',
					emotional_descriptors: ['sad', 'nostalgic'],
					recommended_genres: ['indie', 'folk'],
					suggested_playlist_title: 'Acoustic Sadness'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_energy).toBe(0.3);
				expect(params.target_valence).toBe(0.0);
				expect(params.target_danceability).toBe(0.3);
				expect(params.target_acousticness).toBe(0.8);
				expect(params.target_instrumentalness).toBe(0.7);
				expect(params.seed_genres).toEqual(['indie', 'folk']);
			});

			it('should handle electronic dance mood', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['electronic', 'party', 'upbeat'],
					energy_level: 'high',
					emotional_descriptors: ['energetic', 'excited'],
					recommended_genres: ['edm', 'techno'],
					suggested_playlist_title: 'Electronic Party'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_energy).toBe(0.9);
				expect(params.target_valence).toBeGreaterThan(0.5);
				expect(params.target_danceability).toBe(0.8);
				expect(params.target_acousticness).toBe(0.2);
				expect(params.target_instrumentalness).toBeUndefined();
			});
		});

		describe('Edge Cases', () => {
			it('should handle empty mood_tags array', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_valence).toBe(0.5);
				expect(params.target_danceability).toBe(0.5);
				expect(params.target_acousticness).toBeUndefined();
				expect(params.target_instrumentalness).toBeUndefined();
			});

			it('should handle undefined emotional_descriptors', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['happy'],
					energy_level: 'high',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_valence).toBe(1.0);
			});

			it('should handle empty emotional_descriptors array', () => {
				const mood = createMoodAnalysis({
					mood_tags: ['happy'],
					energy_level: 'high',
					emotional_descriptors: [],
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_valence).toBe(1.0);
			});

			it('should handle whitespace in genre names', () => {
				const mood = createMoodAnalysis({
					mood_tags: [],
					energy_level: 'medium',
					recommended_genres: ['  indie  ', 'ambient  ', '  pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.seed_genres).toEqual(['indie', 'ambient', 'pop']);
			});

			it('should handle very long mood_tags arrays', () => {
				const longTags = Array(100).fill('happy');
				const mood = createMoodAnalysis({
					mood_tags: longTags,
					energy_level: 'high',
					recommended_genres: ['pop'],
					suggested_playlist_title: 'Test'
				});
				const params = moodToSpotifyParams(mood);

				expect(params.target_valence).toBe(1.0);
			});
		});
	});
});