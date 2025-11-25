/**
 * Image processing utilities for Phase 2
 * Handles image validation, compression, and conversion
 */

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
	const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
	return validTypes.includes(file.type);
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	return file.size <= maxSizeBytes;
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			// Remove data URL prefix to get just the base64 string
			const base64 = result.split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({
				width: img.width,
				height: img.height
			});
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};

		img.src = url;
	});
}

/**
 * Compress and resize image if needed
 * Returns a new File object with compressed image
 */
export async function compressImage(
	file: File,
	maxWidth: number = 1920,
	maxHeight: number = 1920,
	quality: number = 0.9
): Promise<File> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Failed to get canvas context'));
			return;
		}

		img.onload = () => {
			let { width, height } = img;

			// Calculate new dimensions while maintaining aspect ratio
			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width *= ratio;
				height *= ratio;
			}

			canvas.width = width;
			canvas.height = height;

			// Draw and compress
			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Failed to compress image'));
						return;
					}

					// Create new File from blob
					const compressedFile = new File([blob], file.name, {
						type: file.type,
						lastModified: Date.now()
					});

					resolve(compressedFile);
				},
				file.type,
				quality
			);

			URL.revokeObjectURL(img.src);
		};

		img.onerror = () => {
			URL.revokeObjectURL(img.src);
			reject(new Error('Failed to load image for compression'));
		};

		img.src = URL.createObjectURL(file);
	});
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Validate and prepare image for upload
 * Returns error message if validation fails, null otherwise
 */
export function validateImageForUpload(file: File): string | null {
	if (!isValidImageType(file)) {
		return 'Please select a valid image file (JPG, PNG, or WebP)';
	}

	if (!isValidImageSize(file, 10)) {
		return 'Image must be smaller than 10MB';
	}

	return null;
}
