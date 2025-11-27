/**
 * Test images for E2E tests
 *
 * These are small base64-encoded images used for testing file upload functionality.
 * Using base64 eliminates the need to manage binary test fixtures.
 */

/**
 * 1x1 pixel PNG (transparent)
 * Smallest valid PNG image for basic upload tests
 */
export const TINY_PNG_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Convert base64 string to Buffer for file upload
 * @param base64 - Base64 encoded image string
 * @returns Buffer suitable for Playwright's setInputFiles
 */
export function base64ToBuffer(base64: string): Buffer {
	return Buffer.from(base64, 'base64');
}

/**
 * Get a test image file for upload testing
 * @returns Object with filename, mimeType, and buffer for Playwright file upload
 */
export function getTestImageFile() {
	return {
		name: 'test-image.png',
		mimeType: 'image/png',
		buffer: base64ToBuffer(TINY_PNG_BASE64)
	};
}

/**
 * Invalid file for error testing (GIF is not supported)
 */
export const INVALID_GIF_FILE = {
	name: 'test.gif',
	mimeType: 'image/gif',
	buffer: Buffer.from('GIF89a') // Minimal GIF header
};
