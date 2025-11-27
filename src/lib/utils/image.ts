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
 * Compress and convert image to base64 for AI analysis
 * Optimized for token efficiency - downscales to max 512x512 at 0.7 quality
 */
export async function fileToBase64ForAI(file: File): Promise<string> {
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

			// Downscale to max 512x512 for AI analysis (saves tokens)
			const maxDimension = 512;
			if (width > maxDimension || height > maxDimension) {
				const ratio = Math.min(maxDimension / width, maxDimension / height);
				width *= ratio;
				height *= ratio;
			}

			canvas.width = width;
			canvas.height = height;

			// Draw and compress
			ctx.drawImage(img, 0, 0, width, height);

			// Convert to base64 with 0.7 quality for smaller size
			const dataURL = canvas.toDataURL('image/jpeg', 0.7);
			// Remove data URL prefix to get just the base64 string
			const base64 = dataURL.split(',')[1];

			URL.revokeObjectURL(img.src);
			resolve(base64);
		};

		img.onerror = () => {
			URL.revokeObjectURL(img.src);
			reject(new Error('Failed to load image for compression'));
		};

		img.src = URL.createObjectURL(file);
	});
}

/**
 * Compress and convert image to base64 specifically for Spotify Playlist Cover
 * Requirements: JPEG, Max 256KB payload
 */
export async function compressImageForSpotifyCover(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Failed to get canvas context'));
			return;
		}

		img.onload = () => {
			// Spotify recommends at least 300x300. We'll aim for 512x512 to keep size down.
			const maxDimension = 512;
			let { width, height } = img;

			// Resize to max dimension while maintaining aspect ratio
			// Note: Spotify playlist covers are usually square, but we handle any aspect ratio
			if (width > maxDimension || height > maxDimension) {
				const ratio = Math.min(maxDimension / width, maxDimension / height);
				width *= ratio;
				height *= ratio;
			}

			canvas.width = width;
			canvas.height = height;

			// Draw image to canvas
			ctx.drawImage(img, 0, 0, width, height);

			// Iteratively reduce quality until size is under 256KB
			// 256KB = 256 * 1024 bytes = 262,144 bytes
			// Base64 overhead is ~33%, so max string length is ~350,000 chars
			// We'll be safe and aim for < 250KB binary (~340,000 base64 chars)
			const MAX_SIZE_BYTES = 250 * 1024; // Safe limit below 256KB
			const MAX_BASE64_LENGTH = Math.floor((MAX_SIZE_BYTES * 4) / 3);

			let quality = 0.9;
			let dataURL = canvas.toDataURL('image/jpeg', quality);
			let base64 = dataURL.split(',')[1];

			// Try reducing quality if too large
			while (base64.length > MAX_BASE64_LENGTH && quality > 0.1) {
				quality -= 0.1;
				dataURL = canvas.toDataURL('image/jpeg', quality);
				base64 = dataURL.split(',')[1];
			}

			URL.revokeObjectURL(img.src);
			resolve(base64);
		};

		img.onerror = () => {
			URL.revokeObjectURL(img.src);
			reject(new Error('Failed to load image for compression'));
		};

		img.src = URL.createObjectURL(file);
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
	if (bytes === 0) return '0 B';
	if (bytes < 1024) return `${bytes} B`;

	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	const ext = filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
	return ext.toLowerCase();
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
