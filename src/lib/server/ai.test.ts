import { describe, it, expect } from 'vitest';
import { validateMoodAnalysis } from './ai';
import type { MoodAnalysis } from '../types/phase2';

describe('AI Analysis Utilities', () => {
	describe('validateMoodAnalysis', () => {
		it('should validate a complete valid mood analysis', () => {
			const validAnalysis: MoodAnalysis = {
				mood_tags: ['calm', 'peaceful', 'serene'],
				color_palette: ['blue', 'white', 'gray'],
				energy_level: 'low',
				emotional_descriptors: ['relaxed', 'content', 'tranquil'],
				atmosphere: 'A peaceful beach scene at sunset',
				recommended_genres: ['ambient', 'chillout', 'downtempo'],
				seed_artists: [],
				seed_tracks: ['Breathe - Pink Floyd', 'Weightless - Marconi Union'],
				suggested_playlist_title: 'Coastal Serenity',
				confidence_score: 0.85
			};

			expect(validateMoodAnalysis(validAnalysis)).toBe(true);
		});

		it('should reject analysis with missing mood_tags', () => {
			const invalidAnalysis = {
				color_palette: ['blue', 'white'],
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with missing color_palette', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with invalid energy_level', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				energy_level: 'super-high', // Invalid
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should accept valid energy levels: low, medium, high', () => {
			const baseAnalysis = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(
				validateMoodAnalysis({
					...baseAnalysis,
					energy_level: 'low'
				})
			).toBe(true);

			expect(
				validateMoodAnalysis({
					...baseAnalysis,
					energy_level: 'medium'
				})
			).toBe(true);

			expect(
				validateMoodAnalysis({
					...baseAnalysis,
					energy_level: 'high'
				})
			).toBe(true);
		});

		it('should reject analysis with missing recommended_genres', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				energy_level: 'low',
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with missing suggested_playlist_title', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				energy_level: 'low',
				recommended_genres: ['ambient']
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-array mood_tags', () => {
			const invalidAnalysis = {
				mood_tags: 'calm', // Should be array
				color_palette: ['blue'],
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-array color_palette', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				color_palette: 'blue', // Should be array
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-array recommended_genres', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				energy_level: 'low',
				recommended_genres: 'ambient', // Should be array
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-string suggested_playlist_title', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 123 // Should be string
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject null or undefined values', () => {
			expect(validateMoodAnalysis(null)).toBe(false);
			expect(validateMoodAnalysis(undefined)).toBe(false);
		});

		it('should reject non-object values', () => {
			expect(validateMoodAnalysis('string')).toBe(false);
			expect(validateMoodAnalysis(123)).toBe(false);
			expect(validateMoodAnalysis(true)).toBe(false);
		});

		it('should accept empty arrays for optional array fields', () => {
			const analysisWithEmptyArrays = {
				mood_tags: [], // Can be empty
				color_palette: [], // Can be empty
				energy_level: 'medium',
				recommended_genres: [], // Can be empty
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(analysisWithEmptyArrays)).toBe(true);
		});

		it('should accept empty string for suggested_playlist_title', () => {
			const analysisWithEmptyTitle = {
				mood_tags: ['calm'],
				color_palette: ['blue'],
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: '' // Empty string is still a string
			};

			expect(validateMoodAnalysis(analysisWithEmptyTitle)).toBe(true);
		});
	});
});
