import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeImage } from '$lib/server/ai';
import type { AnalyzeImageRequest, AnalyzeImageResponse } from '$lib/types/phase2';
import { DEMO_MOOD_ANALYSIS } from '$lib/demo-data';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Demo mode: return mock analysis
		const isDemoMode = cookies.get('demo_mode') === 'true';
		if (isDemoMode) {
			// Add a small delay to simulate processing
			await new Promise((resolve) => setTimeout(resolve, 1500));
			return json({
				success: true,
				mood_analysis: DEMO_MOOD_ANALYSIS
			} satisfies AnalyzeImageResponse);
		}

		// Check if user is authenticated
		const accessToken = cookies.get('spotify_access_token');
		if (!accessToken) {
			return json(
				{
					success: false,
					error: 'Unauthorized: Please log in to use this feature'
				} satisfies AnalyzeImageResponse,
				{ status: 401 }
			);
		}

		// Parse request body
		const body = (await request.json()) as AnalyzeImageRequest;

		if (!body.image || !body.image_type) {
			return json(
				{
					success: false,
					error: 'Missing required fields: image and image_type'
				} satisfies AnalyzeImageResponse,
				{ status: 400 }
			);
		}

		// Validate image type
		const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!validTypes.includes(body.image_type)) {
			return json(
				{
					success: false,
					error: 'Invalid image type. Supported types: JPEG, PNG, WebP'
				} satisfies AnalyzeImageResponse,
				{ status: 400 }
			);
		}

		// Call AI service to analyze image
		const moodAnalysis = await analyzeImage(body.image, body.image_type);

		return json({
			success: true,
			mood_analysis: moodAnalysis
		} satisfies AnalyzeImageResponse);
	} catch (error) {
		console.error('Error in analyze-image endpoint:', error);

		return json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : 'An unexpected error occurred during analysis'
			} satisfies AnalyzeImageResponse,
			{ status: 500 }
		);
	}
};
