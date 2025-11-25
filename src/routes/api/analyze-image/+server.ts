import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeImage } from '$lib/server/ai';
import type { AnalyzeImageRequest, AnalyzeImageResponse } from '$lib/types/phase2';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
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
