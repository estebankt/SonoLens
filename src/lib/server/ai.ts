/**
 * AI Integration for Phase 2
 * Handles image analysis using OpenAI GPT-4o Vision
 */

import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { MoodAnalysis } from '$lib/types/phase2';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

/**
 * Analyze image and extract mood/atmosphere data
 */
export async function analyzeImage(
	imageBase64: string,
	imageType: string
): Promise<MoodAnalysis> {
	const prompt = `You are a music mood analyst. Analyze this image and extract musical mood and atmosphere information.

Please provide a detailed analysis in the following JSON format:

{
  "mood_tags": ["array", "of", "mood", "descriptors"],
  "color_palette": ["dominant", "colors", "in", "the", "image"],
  "energy_level": "low" | "medium" | "high",
  "emotional_descriptors": ["emotional", "qualities"],
  "atmosphere": "brief description of the overall atmosphere",
  "recommended_genres": ["suggested", "music", "genres"],
  "seed_artists": ["optional", "artist", "names"],
  "seed_tracks": ["optional", "track", "names"],
  "suggested_playlist_title": "Creative playlist title based on the mood",
  "confidence_score": 0.0-1.0
}

Guidelines:
- mood_tags: 3-6 words describing the emotional/atmospheric qualities (e.g., "nostalgic", "energetic", "melancholic", "uplifting")
- color_palette: 3-5 dominant colors you observe
- energy_level: Rate the visual energy as low, medium, or high
- emotional_descriptors: 3-5 emotional qualities the image evokes
- atmosphere: 1-2 sentence description of the overall vibe
- recommended_genres: 3-6 music genres that would match this mood
- seed_artists: 0-3 artist names if the image suggests specific musical styles (optional)
- seed_tracks: 0-3 specific track names if applicable (optional)
- suggested_playlist_title: A creative, evocative title for a playlist matching this mood
- confidence_score: Your confidence in the analysis (0.0-1.0)

Respond ONLY with valid JSON, no additional text.`;

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
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

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error('No content in AI response');
		}

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
