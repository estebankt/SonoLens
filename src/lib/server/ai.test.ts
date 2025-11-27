import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateMoodAnalysis, analyzeImage } from './ai';
import { mockMoodAnalysis } from '../../../tests/unit/helpers/fixtures';

// Mock OpenAI
const mockCreate = vi.fn();
vi.mock('openai', () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			chat: {
				completions: {
					create: mockCreate
				}
			}
		}))
	};
});

// Mock environment variables
vi.mock('$env/static/private', () => ({
	OPENAI_API_KEY: 'test-api-key'
}));

vi.mock('$env/dynamic/private', () => ({
	env: { OPENAI_MODEL: 'gpt-4o' }
}));

describe('AI Analysis Utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Suppress console output
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('analyzeImage', () => {
		it('should successfully analyze image and return parsed data', async () => {
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: { content: JSON.stringify(mockMoodAnalysis) },
						finish_reason: 'stop'
					}
				]
			});

			const result = await analyzeImage('base64-data', 'image/jpeg');

			expect(result).toEqual(mockMoodAnalysis);
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					model: 'gpt-4o',
					response_format: { type: 'json_object' }
				})
			);
		});

		it('should handle content filter errors', async () => {
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: { content: null },
						finish_reason: 'content_filter'
					}
				]
			});
			// Second attempt fails too (since we can't change model response easily in loop for same mock)
			// Actually, the code tries multiple models.
			// If we want to test fallback, we need mockCreate to return sequence of responses.

			// To simulate complete failure:
			mockCreate.mockRejectedValue(new Error('Content policy violation'));

			await expect(analyzeImage('base64-data', 'image/jpeg')).rejects.toThrow(
				'Failed to analyze image'
			);
		});

		it('should retry with different models on failure', async () => {
			// First call fails
			mockCreate.mockRejectedValueOnce(new Error('Model overloaded'));
			// Second call succeeds
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: { content: JSON.stringify(mockMoodAnalysis) },
						finish_reason: 'stop'
					}
				]
			});

			const result = await analyzeImage('base64-data', 'image/jpeg');

			expect(result).toEqual(mockMoodAnalysis);
			expect(mockCreate).toHaveBeenCalledTimes(2);
		});

		it('should throw error if response is not valid JSON', async () => {
			mockCreate.mockResolvedValue({
				choices: [
					{
						message: { content: 'Not JSON' },
						finish_reason: 'stop'
					}
				]
			});

			await expect(analyzeImage('base64-data', 'image/jpeg')).rejects.toThrow();
		});

		it('should throw error if required fields are missing', async () => {
			const incompleteData = { mood_tags: [] }; // Missing energy_level etc.
			mockCreate.mockResolvedValue({
				choices: [
					{
						message: { content: JSON.stringify(incompleteData) },
						finish_reason: 'stop'
					}
				]
			});

			await expect(analyzeImage('base64-data', 'image/jpeg')).rejects.toThrow(
				'missing required fields'
			);
		});
	});

	describe('validateMoodAnalysis', () => {
		it('should validate a complete valid mood analysis', () => {
			expect(validateMoodAnalysis(mockMoodAnalysis)).toBe(true);
		});

		it('should reject analysis with missing mood_tags', () => {
			const invalidAnalysis = {
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with invalid energy_level', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				energy_level: 'super-high', // Invalid
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should accept valid energy levels: low, medium, high', () => {
			const baseAnalysis = {
				mood_tags: ['calm'],
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
				energy_level: 'low',
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with missing suggested_playlist_title', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				energy_level: 'low',
				recommended_genres: ['ambient']
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-array mood_tags', () => {
			const invalidAnalysis = {
				mood_tags: 'calm', // Should be array
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-array recommended_genres', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
				energy_level: 'low',
				recommended_genres: 'ambient', // Should be array
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(invalidAnalysis)).toBe(false);
		});

		it('should reject analysis with non-string suggested_playlist_title', () => {
			const invalidAnalysis = {
				mood_tags: ['calm'],
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
				energy_level: 'medium',
				recommended_genres: [], // Can be empty
				suggested_playlist_title: 'Test'
			};

			expect(validateMoodAnalysis(analysisWithEmptyArrays)).toBe(true);
		});

		it('should accept empty string for suggested_playlist_title', () => {
			const analysisWithEmptyTitle = {
				mood_tags: ['calm'],
				energy_level: 'low',
				recommended_genres: ['ambient'],
				suggested_playlist_title: '' // Empty string is still a string
			};

			expect(validateMoodAnalysis(analysisWithEmptyTitle)).toBe(true);
		});
	});
});
