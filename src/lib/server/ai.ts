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
	const models = [OPENAI_MODEL || 'gpt-4-turbo', 'gpt-4o', 'gpt-4-vision-preview'];

	// Remove duplicates while preserving order
	const uniqueModels = [...new Set(models)];

	let lastError: Error | null = null;

	for (const model of uniqueModels) {
		try {
			console.warn(`🔍 Attempting image analysis with model: ${model}`);

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
									detail: 'low' // Optimized for 512x512 images - saves 20-30% tokens
								}
							},
							{
								type: 'text',
								text: prompt
							}
						]
					}
				],
				max_tokens: 800, // Reduced from 1024 - sufficient for 8-12 tracks
				response_format: { type: 'json_object' }
			});

			// Validate response structure
			if (!response.choices || response.choices.length === 0) {
				throw new Error('OpenAI returned no response choices');
			}

			const choice = response.choices[0];
			console.warn(`Model ${model} finish_reason:`, choice.finish_reason);

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

			console.warn(`✓ Successfully analyzed image with model: ${model}`);
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
			console.warn(`Falling back to next model...`);
			continue;
		}
	}

	// Should never reach here, but just in case
	throw lastError || new Error('All OpenAI models failed to analyze the image');
}

/**
 * Analyze image and extract mood/atmosphere data
 */
export async function analyzeImage(imageBase64: string, imageType: string): Promise<MoodAnalysis> {
	const prompt = `You are an expert music curator. Analyze this image deeply and generate a playlist that feels coherent, intentional, and unified — not just random songs.

Your output MUST be JSON with this exact structure:

{
  "mood_tags": [...],
  "energy_level": "low" | "medium" | "high",
  "emotional_descriptors": [...],
  "atmosphere": "...",
  "recommended_genres": [...],
  "seed_tracks": [...],
  "suggested_playlist_title": "...",
  "confidence_score": 0.0-1.0
}

STRONG CONSTRAINTS FOR BETTER PLAYLISTS:

**1. Cohesion Rule**
All seed_tracks must feel like they belong to **the same playlist**.
They should share:
- similar mood & emotional tone
- similar energy level
- compatible instrumentation
- compatible production style
- compatible eras OR a deliberately blended aesthetic

The playlist must feel *curated*, not random.

**2. Genre Rule**
recommended_genres must:
- be 3–6 genres
- reflect a tight, unified sonic direction
- avoid mixing unrelated genres (e.g., don’t mix metal + classical + EDM)

**3. Track Selection Rules**
seed_tracks must:
- be 8–12 REAL, well-known songs
- match the visual vibe closely
- avoid huge genre jumps
- avoid repeating artists
- reflect the “center of gravity” of the mood
- lean into the strongest visual theme (e.g. nostalgia, melancholy, energy, introspection)

Examples of playlist cohesion:
- “indie dream-pop + soft synth ambience”
- “lofi beats + mellow jazz-hop”
- “cinematic orchestral minimalism”
- “dark synthwave + retro electronics”

**4. Mood Extraction Logic**
The playlist must be based on:
- lighting (warm, cold, neon, natural)
- colors (dark, pastel, saturated)
- composition (busy, empty, balanced)
- subject emotion
- setting (urban, nature, night, rain, cozy, explosive)

**5. Atmosphere Rule**
The atmosphere must be 1–2 sentences describing the *exact vibe* that guides the music.

**6. JSON Formatting Rule**
Respond ONLY with the JSON — no explanations, no markdown, no commentary.

`;

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
		console.warn(`Error generating image analysis: ${error}`);
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
		['low', 'medium', 'high'].includes(analysis.energy_level) &&
		Array.isArray(analysis.recommended_genres) &&
		typeof analysis.suggested_playlist_title === 'string'
	);
}
