import { describe, it, expect } from 'vitest';
import {
	isValidImageType,
	isValidImageSize,
	formatFileSize,
	getFileExtension,
	validateImageForUpload
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
});
