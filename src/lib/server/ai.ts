/**
 * AI Integration for Phase 2
 * Handles image analysis using OpenAI GPT-4o Vision
 */

import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';
import type { MoodAnalysis } from '$lib/types/phase2';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

// Optional: Allow custom model via environment variable
const OPENAI_MODEL = env.OPENAI_MODEL;

/**
 * Helper function to try multiple OpenAI models with automatic fallback
 */
async function analyzeWithFallback(
	imageBase64: string,
	imageType: string,
	prompt: string
): Promise<string> {
	// Build model list with environment variable first, then fallbacks
	const models = [
		OPENAI_MODEL || 'gpt-4-turbo',
		'gpt-4o',
		'gpt-4-vision-preview'
	];

	// Remove duplicates while preserving order
	const uniqueModels = [...new Set(models)];

	let lastError: Error | null = null;

	for (const model of uniqueModels) {
		try {
			console.log(`🔍 Attempting image analysis with model: ${model}`);

			const response = await openai.chat.completions.create({
				model,
				messages: [
					{
						role: 'user',
						content: [
							{
								type: 'image_url',
								image_url: {
									url: `data:${imageType};base64,${imageBase64}`,
									detail: 'high'
								}
							},
							{
								type: 'text',
								text: prompt
							}
						]
					}
				],
				max_tokens: 1024,
				response_format: { type: 'json_object' }
			});

			// Validate response structure
			if (!response.choices || response.choices.length === 0) {
				throw new Error('OpenAI returned no response choices');
			}

			const choice = response.choices[0];
			console.log(`Model ${model} finish_reason:`, choice.finish_reason);

			// Handle different finish reasons
			if (choice.finish_reason === 'content_filter') {
				throw new Error(
					'Image was flagged by OpenAI content policy. Please try a different image.'
				);
			}

			if (choice.finish_reason === 'length') {
				throw new Error('Response was too long and was cut off. This is unexpected.');
			}

			if (!choice.message) {
				throw new Error('OpenAI response missing message object');
			}

			const content = choice.message.content;
			if (!content) {
				console.error(`Empty content with finish_reason: ${choice.finish_reason}`);
				throw new Error(
					`OpenAI returned no content (finish_reason: ${choice.finish_reason || 'unknown'})`
				);
			}

			console.log(`✓ Successfully analyzed image with model: ${model}`);
			return content;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`✗ Model ${model} failed:`, errorMessage);

			lastError = error instanceof Error ? error : new Error(errorMessage);

			// If this is the last model, re-throw the error
			if (model === uniqueModels[uniqueModels.length - 1]) {
				console.error('All models failed. Last error:', errorMessage);
				throw lastError;
			}

			// Otherwise, try the next model
			console.log(`Falling back to next model...`);
			continue;
		}
	}

	// Should never reach here, but just in case
	throw lastError || new Error('All OpenAI models failed to analyze the image');
}

/**
 * Analyze image and extract mood/atmosphere data
 */
export async function analyzeImage(
	imageBase64: string,
	imageType: string
): Promise<MoodAnalysis> {
	const prompt = `You are an expert music curator. Analyze this image and create a playlist of real songs that match its mood and atmosphere.

Your JSON format:

{
  "mood_tags": [...],
  "color_palette": [...],
  "energy_level": "low" | "medium" | "high",
  "emotional_descriptors": [...],
  "atmosphere": "...",
  "recommended_genres": [...],
  "seed_artists": [],
  "seed_tracks": [...],
  "suggested_playlist_title": "...",
  "confidence_score": 0.0-1.0
}

Guidelines:
- mood_tags: 3-6 words describing the emotional/atmospheric qualities
- color_palette: 3-5 dominant colors you observe
- energy_level: Rate the visual energy as low, medium, or high
- emotional_descriptors: 3-5 emotional qualities the image evokes
- atmosphere: 1-2 sentence description of the overall vibe
- recommended_genres: 3-6 music genres that match this mood (any genres are fine)
- seed_artists: MUST be empty array []
- seed_tracks: Array of 15-25 REAL song names that match this mood and energy level
  * Include artist name with track: "Song Name - Artist Name"
  * Choose well-known songs that exist on Spotify
  * Match the mood, energy, and atmosphere of the image
  * Vary the artists (don't repeat the same artist too much)
  * Examples: "Breathe - Pink Floyd", "Clair de Lune - Claude Debussy", "Nude - Radiohead"
- suggested_playlist_title: A creative, evocative title for this playlist
- confidence_score: Your confidence in the analysis (0.0-1.0)

CRITICAL:
- seed_artists MUST be empty array []
- seed_tracks MUST contain 15-25 real song names with artist
- Format: "Track Name - Artist Name"

Respond ONLY with valid JSON, no additional text.`;

	try {
		// Use fallback strategy to try multiple models
		const content = await analyzeWithFallback(imageBase64, imageType, prompt);

		console.log('AI Content:', content);

		// Parse JSON response
		const analysis = JSON.parse(content) as MoodAnalysis;

		// Validate required fields
		if (
			!analysis.mood_tags ||
			!analysis.energy_level ||
			!analysis.recommended_genres ||
			!analysis.suggested_playlist_title
		) {
			throw new Error('Invalid AI response format: missing required fields');
		}

		return analysis;
	} catch (error) {
		console.error('Error analyzing image with OpenAI:', error);
		throw new Error(
			`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Validate MoodAnalysis response
 */
export function validateMoodAnalysis(analysis: any): analysis is MoodAnalysis {
	return (
		typeof analysis === 'object' &&
		Array.isArray(analysis.mood_tags) &&
		Array.isArray(analysis.color_palette) &&
		['low', 'medium', 'high'].includes(analysis.energy_level) &&
		Array.isArray(analysis.recommended_genres) &&
		typeof analysis.suggested_playlist_title === 'string'
	);
}
