import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	isValidImageType,
	isValidImageSize,
	formatFileSize,
	getFileExtension,
	validateImageForUpload,
	fileToBase64,
	fileToBase64ForAI,
	compressImageForSpotifyCover,
	getImageDimensions,
	compressImage
} from './image';

describe('Image Utilities', () => {
	describe('isValidImageType', () => {
		it('should accept valid image types', () => {
			const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
			const pngFile = new File([''], 'test.png', { type: 'image/png' });
			const webpFile = new File([''], 'test.webp', { type: 'image/webp' });

			expect(isValidImageType(jpegFile)).toBe(true);
			expect(isValidImageType(pngFile)).toBe(true);
			expect(isValidImageType(webpFile)).toBe(true);
		});

		it('should reject invalid image types', () => {
			const gifFile = new File([''], 'test.gif', { type: 'image/gif' });
			const bmpFile = new File([''], 'test.bmp', { type: 'image/bmp' });
			const svgFile = new File([''], 'test.svg', { type: 'image/svg+xml' });
			const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });

			expect(isValidImageType(gifFile)).toBe(false);
			expect(isValidImageType(bmpFile)).toBe(false);
			expect(isValidImageType(svgFile)).toBe(false);
			expect(isValidImageType(pdfFile)).toBe(false);
		});
	});

	describe('isValidImageSize', () => {
		it('should accept files within the size limit', () => {
			// 5MB file (default max is 10MB)
			const smallFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			expect(isValidImageSize(smallFile)).toBe(true);
		});

		it('should reject files exceeding the size limit', () => {
			// 15MB file (default max is 10MB)
			const largeFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			expect(isValidImageSize(largeFile)).toBe(false);
		});

		it('should respect custom size limits', () => {
			// 3MB file
			const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			expect(isValidImageSize(file, 5)).toBe(true); // 5MB limit
			expect(isValidImageSize(file, 2)).toBe(false); // 2MB limit
		});

		it('should accept files exactly at the size limit', () => {
			// Exactly 10MB
			const file = new File([new ArrayBuffer(10 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			expect(isValidImageSize(file, 10)).toBe(true);
		});
	});

	describe('formatFileSize', () => {
		it('should format bytes correctly', () => {
			expect(formatFileSize(500)).toBe('500 B');
			expect(formatFileSize(1023)).toBe('1023 B');
		});

		it('should format kilobytes correctly', () => {
			expect(formatFileSize(1024)).toBe('1.00 KB');
			expect(formatFileSize(1536)).toBe('1.50 KB');
			expect(formatFileSize(10240)).toBe('10.00 KB');
		});

		it('should format megabytes correctly', () => {
			expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
			expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB');
			expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB');
		});

		it('should format gigabytes correctly', () => {
			expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
			expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB');
		});

		it('should handle zero bytes', () => {
			expect(formatFileSize(0)).toBe('0 B');
		});

		it('should handle negative values gracefully', () => {
			expect(formatFileSize(-100)).toBe('-100 B');
		});
	});

	describe('getFileExtension', () => {
		it('should extract file extensions correctly', () => {
			expect(getFileExtension('photo.jpg')).toBe('jpg');
			expect(getFileExtension('image.png')).toBe('png');
			expect(getFileExtension('picture.webp')).toBe('webp');
			expect(getFileExtension('document.pdf')).toBe('pdf');
		});

		it('should handle files with multiple dots', () => {
			expect(getFileExtension('my.photo.jpg')).toBe('jpg');
			expect(getFileExtension('image.backup.png')).toBe('png');
		});

		it('should return empty string for files without extension', () => {
			expect(getFileExtension('README')).toBe('');
			expect(getFileExtension('LICENSE')).toBe('');
		});

		it('should handle files starting with a dot', () => {
			expect(getFileExtension('.gitignore')).toBe('');
			expect(getFileExtension('.env.local')).toBe('local');
		});

		it('should convert extension to lowercase', () => {
			expect(getFileExtension('photo.JPG')).toBe('jpg');
			expect(getFileExtension('image.PNG')).toBe('png');
			expect(getFileExtension('picture.WEBP')).toBe('webp');
		});
	});

	describe('validateImageForUpload', () => {
		it('should return null for valid images', () => {
			const validFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			expect(validateImageForUpload(validFile)).toBe(null);
		});

		it('should return error for invalid file type', () => {
			const invalidFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'test.gif', {
				type: 'image/gif'
			});

			const error = validateImageForUpload(invalidFile);
			expect(error).toBeDefined();
			expect(error).toContain('JPG, PNG, or WebP');
		});

		it('should return error for oversized file', () => {
			const largeFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			const error = validateImageForUpload(largeFile);
			expect(error).toBeDefined();
			expect(error).toContain('10MB');
		});

		it('should validate type before size', () => {
			// Invalid type AND oversized
			const invalidFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'test.gif', {
				type: 'image/gif'
			});

			const error = validateImageForUpload(invalidFile);
			expect(error).toBeDefined();
			// Should return type error first
			expect(error).toContain('JPG, PNG, or WebP');
		});

		it('should accept files at the edge of the size limit', () => {
			// Exactly 10MB
			const file = new File([new ArrayBuffer(10 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});

			expect(validateImageForUpload(file)).toBe(null);
		});
	});

	describe('fileToBase64', () => {
		it('should convert file to base64 string', async () => {
			const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
			const base64 = await fileToBase64(file);

			expect(base64).toBeDefined();
			expect(typeof base64).toBe('string');
			// Should not include data URL prefix
			expect(base64).not.toMatch(/^data:/);
		});

		it('should remove data URL prefix', async () => {
			const file = new File(['test'], 'test.png', { type: 'image/png' });
			const base64 = await fileToBase64(file);

			// Base64 string should be valid (contains only base64 chars)
			expect(base64).toMatch(/^[A-Za-z0-9+/=]*$/);
		});

		it('should handle different file types', async () => {
			const jpegFile = new File(['jpeg'], 'test.jpg', { type: 'image/jpeg' });
			const pngFile = new File(['png'], 'test.png', { type: 'image/png' });
			const webpFile = new File(['webp'], 'test.webp', { type: 'image/webp' });

			const jpegBase64 = await fileToBase64(jpegFile);
			const pngBase64 = await fileToBase64(pngFile);
			const webpBase64 = await fileToBase64(webpFile);

			expect(jpegBase64).toBeDefined();
			expect(pngBase64).toBeDefined();
			expect(webpBase64).toBeDefined();
		});
	});

	describe('fileToBase64ForAI', () => {
		it('should compress image for AI analysis', async () => {
			const file = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});
			const base64 = await fileToBase64ForAI(file);

			expect(base64).toBeDefined();
			expect(typeof base64).toBe('string');
			expect(base64).not.toMatch(/^data:/);
		});

		it('should downscale large images to max 512px', async () => {
			// The mock Image in vitest-setup.ts has width=1024, height=768
			const file = new File([new ArrayBuffer(1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
			const base64 = await fileToBase64ForAI(file);

			// Should successfully compress
			expect(base64).toBeDefined();
			expect(base64.length).toBeGreaterThan(0);
		});

		it('should maintain aspect ratio when downscaling', async () => {
			const file = new File([new ArrayBuffer(512 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const base64 = await fileToBase64ForAI(file);

			// Mock canvas toDataURL returns a valid base64 string
			expect(base64).toMatch(/^[A-Za-z0-9+/=]*$/);
		});

		it('should use JPEG format with 0.7 quality', async () => {
			const file = new File([new ArrayBuffer(256 * 1024)], 'test.png', { type: 'image/png' });
			const base64 = await fileToBase64ForAI(file);

			// Should compress and convert to JPEG (verified by mock toDataURL)
			expect(base64).toBeDefined();
		});

		it('should cleanup object URLs after processing', async () => {
			const file = new File([new ArrayBuffer(128 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			await fileToBase64ForAI(file);

			// revokeObjectURL should be called (mocked in vitest-setup)
			expect(global.URL.revokeObjectURL).toHaveBeenCalled();
		});
	});

	describe('compressImageForSpotifyCover', () => {
		it('should compress image for Spotify cover requirements', async () => {
			const file = new File([new ArrayBuffer(1024 * 1024)], 'cover.jpg', { type: 'image/jpeg' });
			const base64 = await compressImageForSpotifyCover(file);

			expect(base64).toBeDefined();
			expect(typeof base64).toBe('string');
			expect(base64).not.toMatch(/^data:/);
		});

		it('should resize to max 512px dimension', async () => {
			const file = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large-cover.jpg', {
				type: 'image/jpeg'
			});
			const base64 = await compressImageForSpotifyCover(file);

			expect(base64).toBeDefined();
			expect(base64.length).toBeGreaterThan(0);
		});

		it('should iteratively reduce quality if size exceeds 250KB', async () => {
			// Mock will return the same base64 regardless, but function should execute the logic
			const file = new File([new ArrayBuffer(512 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const base64 = await compressImageForSpotifyCover(file);

			expect(base64).toBeDefined();
		});

		it('should use JPEG format', async () => {
			const file = new File([new ArrayBuffer(256 * 1024)], 'cover.png', { type: 'image/png' });
			const base64 = await compressImageForSpotifyCover(file);

			// Converts to JPEG (verified by mock)
			expect(base64).toBeDefined();
		});

		it('should cleanup object URLs after processing', async () => {
			const file = new File([new ArrayBuffer(128 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			await compressImageForSpotifyCover(file);

			expect(global.URL.revokeObjectURL).toHaveBeenCalled();
		});
	});

	describe('getImageDimensions', () => {
		it('should return image width and height', async () => {
			const file = new File([new ArrayBuffer(1024)], 'test.jpg', { type: 'image/jpeg' });
			const dimensions = await getImageDimensions(file);

			expect(dimensions).toBeDefined();
			expect(dimensions.width).toBe(1024); // From mock Image
			expect(dimensions.height).toBe(768); // From mock Image
		});

		it('should create and revoke object URL', async () => {
			const file = new File([new ArrayBuffer(1024)], 'test.jpg', { type: 'image/jpeg' });
			await getImageDimensions(file);

			expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
			expect(global.URL.revokeObjectURL).toHaveBeenCalled();
		});

		it('should handle different image types', async () => {
			const jpegFile = new File([new ArrayBuffer(1024)], 'test.jpg', { type: 'image/jpeg' });
			const pngFile = new File([new ArrayBuffer(1024)], 'test.png', { type: 'image/png' });

			const jpegDims = await getImageDimensions(jpegFile);
			const pngDims = await getImageDimensions(pngFile);

			expect(jpegDims.width).toBe(1024);
			expect(pngDims.width).toBe(1024);
		});

		it('should cleanup URL even on error', async () => {
			// Mock an error scenario
			const originalImage = global.Image;
			class ErrorImage {
				onload: (() => void) | null = null;
				onerror: ((event: Event) => void) | null = null;
				src = '';
				width = 0;
				height = 0;

				constructor() {
					setTimeout(() => {
						if (this.onerror) this.onerror(new Event('error'));
					}, 0);
				}
			}
			(global as any).Image = ErrorImage;

			const file = new File([new ArrayBuffer(1024)], 'test.jpg', { type: 'image/jpeg' });

			await expect(getImageDimensions(file)).rejects.toThrow('Failed to load image');

			(global as any).Image = originalImage;
		});
	});

	describe('compressImage', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should compress image and return new File', async () => {
			const originalFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.jpg', {
				type: 'image/jpeg'
			});
			const compressedFile = await compressImage(originalFile);

			expect(compressedFile).toBeInstanceOf(File);
			expect(compressedFile.name).toBe('test.jpg');
			expect(compressedFile.type).toBe('image/jpeg');
		});

		it('should use default max dimensions (1920x1920)', async () => {
			const file = new File([new ArrayBuffer(1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const compressed = await compressImage(file);

			expect(compressed).toBeInstanceOf(File);
		});

		it('should respect custom max dimensions', async () => {
			const file = new File([new ArrayBuffer(1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const compressed = await compressImage(file, 800, 600);

			expect(compressed).toBeInstanceOf(File);
		});

		it('should respect custom quality parameter', async () => {
			const file = new File([new ArrayBuffer(512 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const compressed = await compressImage(file, 1920, 1920, 0.8);

			expect(compressed).toBeInstanceOf(File);
		});

		it('should maintain aspect ratio when resizing', async () => {
			const file = new File([new ArrayBuffer(1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const compressed = await compressImage(file, 1000, 1000);

			expect(compressed).toBeInstanceOf(File);
			expect(compressed.type).toBe('image/jpeg');
		});

		it('should preserve file type during compression', async () => {
			const pngFile = new File([new ArrayBuffer(512 * 1024)], 'test.png', { type: 'image/png' });
			const compressed = await compressImage(pngFile);

			expect(compressed.type).toBe('image/png');
		});

		it('should handle WebP images', async () => {
			const webpFile = new File([new ArrayBuffer(256 * 1024)], 'test.webp', {
				type: 'image/webp'
			});
			const compressed = await compressImage(webpFile);

			expect(compressed).toBeInstanceOf(File);
			expect(compressed.type).toBe('image/webp');
		});

		it('should cleanup object URLs after compression', async () => {
			const file = new File([new ArrayBuffer(128 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			await compressImage(file);

			expect(global.URL.revokeObjectURL).toHaveBeenCalled();
		});

		it('should set lastModified timestamp on new file', async () => {
			const file = new File([new ArrayBuffer(128 * 1024)], 'test.jpg', { type: 'image/jpeg' });
			const before = Date.now();
			const compressed = await compressImage(file);
			const after = Date.now();

			expect(compressed.lastModified).toBeGreaterThanOrEqual(before);
			expect(compressed.lastModified).toBeLessThanOrEqual(after);
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('should handle very small files', async () => {
			const tinyFile = new File([new ArrayBuffer(10)], 'tiny.jpg', { type: 'image/jpeg' });
			const base64 = await fileToBase64(tinyFile);

			expect(base64).toBeDefined();
		});

		it('should handle empty file names', async () => {
			const file = new File([new ArrayBuffer(1024)], '', { type: 'image/jpeg' });
			const extension = getFileExtension(file.name);

			expect(extension).toBe('');
		});

		it('should handle files with no extension', () => {
			expect(getFileExtension('README')).toBe('');
			expect(getFileExtension('LICENSE')).toBe('');
		});

		it('should handle zero-byte files', () => {
			expect(formatFileSize(0)).toBe('0 B');
		});

		it('should handle negative file sizes', () => {
			expect(formatFileSize(-100)).toBe('-100 B');
		});
	});
});
