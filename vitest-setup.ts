import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Image API for testing image processing functions
class MockImage {
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	src = '';
	width = 1024;
	height = 768;

	constructor() {
		// Simulate async image loading
		setTimeout(() => {
			if (this.onload) this.onload();
		}, 0);
	}
}

global.Image = MockImage as any;
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Canvas API for image compression and manipulation
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
	drawImage: vi.fn(),
	clearRect: vi.fn(),
	fillRect: vi.fn(),
	getImageData: vi.fn(() => ({
		data: new Uint8ClampedArray(4),
		width: 1,
		height: 1
	})),
	putImageData: vi.fn(),
	createImageData: vi.fn(),
	save: vi.fn(),
	restore: vi.fn(),
	scale: vi.fn(),
	rotate: vi.fn(),
	translate: vi.fn(),
	transform: vi.fn(),
	setTransform: vi.fn()
})) as any;

HTMLCanvasElement.prototype.toDataURL = vi.fn(
	() =>
		'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
);

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
	// Simulate async blob creation
	setTimeout(() => {
		callback(new Blob(['mock-blob-data'], { type: 'image/jpeg' }));
	}, 0);
});
