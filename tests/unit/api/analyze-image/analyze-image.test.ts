import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../../../../src/routes/api/analyze-image/+server';
import {
	createMockRequestEvent,
	createMockCookies,
	createMockRequestWithBody
} from '../../../../tests/unit/helpers/sveltekit-mocks';
import { mockMoodAnalysis } from '../../../../tests/unit/helpers/fixtures';

// Mock the AI module
vi.mock('$lib/server/ai', () => ({
	analyzeImage: vi.fn()
}));

import { analyzeImage } from '$lib/server/ai';

describe('API: /api/analyze-image', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST', () => {
		it('should return 401 when user is not authenticated', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/jpeg'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({}) // No tokens
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Unauthorized');
		});

		it('should return 400 when image field is missing', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image_type: 'image/jpeg'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Missing required fields');
		});

		it('should return 400 when image_type field is missing', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Missing required fields');
		});

		it('should return 400 for invalid image type', async () => {
			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/gif'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain('Invalid image type');
		});

		it('should accept image/jpeg type', async () => {
			vi.mocked(analyzeImage).mockResolvedValue(mockMoodAnalysis);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/jpeg'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
		});

		it('should accept image/png type', async () => {
			vi.mocked(analyzeImage).mockResolvedValue(mockMoodAnalysis);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/png'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);

			expect(response.status).toBe(200);
		});

		it('should accept image/webp type', async () => {
			vi.mocked(analyzeImage).mockResolvedValue(mockMoodAnalysis);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/webp'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);

			expect(response.status).toBe(200);
		});

		it('should successfully analyze image and return mood analysis', async () => {
			vi.mocked(analyzeImage).mockResolvedValue(mockMoodAnalysis);

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/jpeg'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(analyzeImage).toHaveBeenCalledWith('base64-image-data', 'image/jpeg');
			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.mood_analysis).toEqual(mockMoodAnalysis);
		});

		it('should return 500 when AI analysis fails', async () => {
			vi.mocked(analyzeImage).mockRejectedValue(new Error('AI service unavailable'));

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/jpeg'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain('AI service unavailable');
		});

		it('should handle generic errors gracefully', async () => {
			vi.mocked(analyzeImage).mockRejectedValue('Unknown error');

			const mockRequest = createMockRequestWithBody(
				'http://localhost:5173/api/analyze-image',
				'POST',
				{
					image: 'base64-image-data',
					image_type: 'image/jpeg'
				}
			);

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				cookies: createMockCookies({ access: 'mock-token' })
			});

			const response = await POST(mockEvent as any);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toContain('unexpected error');
		});
	});
});
