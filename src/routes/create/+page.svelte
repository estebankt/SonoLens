<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ImageUploadState, MoodAnalysis, AnalyzeImageResponse } from '$lib/types/phase2';
	import { fileToBase64 } from '$lib/utils/image';
	import MoodAnalysisDisplay from '$lib/components/MoodAnalysisDisplay.svelte';

	let uploadState = $state<ImageUploadState>({
		file: null,
		preview_url: null,
		is_uploading: false,
		error: null
	});

	let moodAnalysis = $state<MoodAnalysis | null>(null);
	let fileInput = $state<HTMLInputElement>();

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Reset error and analysis
		uploadState.error = null;
		moodAnalysis = null;

		// Validate file type
		const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			uploadState.error = 'Please select a valid image file (JPG, PNG, or WebP)';
			return;
		}

		// Validate file size (10MB max)
		const maxSize = 10 * 1024 * 1024; // 10MB in bytes
		if (file.size > maxSize) {
			uploadState.error = 'Image must be smaller than 10MB';
			return;
		}

		// Create preview URL
		const reader = new FileReader();
		reader.onload = (e) => {
			uploadState.file = file;
			uploadState.preview_url = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function clearImage() {
		uploadState = {
			file: null,
			preview_url: null,
			is_uploading: false,
			error: null
		};
		moodAnalysis = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}

	async function handleAnalyze() {
		if (!uploadState.file || !uploadState.preview_url) return;

		uploadState.is_uploading = true;
		uploadState.error = null;

		try {
			// Convert file to base64
			const base64Image = await fileToBase64(uploadState.file);

			// Call API to analyze image
			const response = await fetch('/api/analyze-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					image: base64Image,
					image_type: uploadState.file.type
				})
			});

			const data: AnalyzeImageResponse = await response.json();

			if (!data.success || !data.mood_analysis) {
				throw new Error(data.error || 'Failed to analyze image');
			}

			moodAnalysis = data.mood_analysis;
		} catch (error) {
			console.error('Error analyzing image:', error);
			uploadState.error =
				error instanceof Error ? error.message : 'Failed to analyze image. Please try again.';
		} finally {
			uploadState.is_uploading = false;
		}
	}

	function handleGeneratePlaylist() {
		if (!moodAnalysis) return;
		// TODO: Navigate to playlist generation
		console.log('Generating playlist with mood:', moodAnalysis);
	}
</script>

<div class="min-h-screen p-4 sm:p-8">
	<div class="max-w-3xl mx-auto">
		<div class="mb-6">
			<h1 class="text-4xl sm:text-5xl mb-2">Create Playlist</h1>
			<p class="text-lg text-gray-600">Upload an image to generate a mood-based playlist</p>
		</div>

		<div class="neo-card">
			{#if !uploadState.preview_url}
				<!-- Upload Area -->
				<div class="text-center">
					<div class="border-4 border-dashed border-black p-8 sm:p-12 bg-gray-50">
						<svg
							class="mx-auto mb-4 w-16 h-16"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>

						<h2 class="text-2xl font-bold mb-2">Upload an Image</h2>
						<p class="text-gray-600 mb-6">
							Choose a photo that represents the mood you want to capture
						</p>

						<input
							bind:this={fileInput}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							capture="environment"
							onchange={handleFileSelect}
							class="hidden"
							id="file-input"
						/>

						<div class="flex flex-col sm:flex-row gap-3 justify-center">
							<label for="file-input" class="neo-button cursor-pointer">
								Choose File
							</label>

							<label for="file-input" class="neo-button cursor-pointer">
								Take Photo
							</label>
						</div>

						<p class="text-sm text-gray-500 mt-4">
							Supported formats: JPG, PNG, WebP (Max 10MB)
						</p>
					</div>

					{#if uploadState.error}
						<div class="mt-4 p-4 bg-red-100 border-4 border-red-500 text-red-700">
							<p class="font-bold">{uploadState.error}</p>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Preview Area -->
				<div>
					<div class="mb-4">
						<img
							src={uploadState.preview_url}
							alt="Preview"
							class="w-full max-h-96 object-contain border-4 border-black"
						/>
					</div>

					{#if uploadState.is_uploading}
						<!-- Progress Bar -->
						<div class="mb-4 p-6 bg-yellow-100 border-4 border-black">
							<div class="flex items-center gap-3 mb-3">
								<div class="animate-spin h-6 w-6 border-4 border-black border-t-transparent rounded-full"></div>
								<h3 class="text-xl font-bold">Analyzing Image...</h3>
							</div>
							<p class="text-sm mb-3">AI is extracting mood and atmosphere from your image</p>

							<!-- Progress Bar -->
							<div class="w-full bg-white border-4 border-black h-8 overflow-hidden">
								<div class="h-full bg-black animate-pulse" style="width: 100%"></div>
							</div>
						</div>
					{/if}

					<div class="flex flex-col sm:flex-row gap-3">
						<button
							onclick={handleAnalyze}
							disabled={uploadState.is_uploading}
							class="neo-button flex-1"
							class:opacity-50={uploadState.is_uploading}
							class:cursor-not-allowed={uploadState.is_uploading}
						>
							{uploadState.is_uploading ? 'Analyzing...' : 'Analyze & Generate Playlist'}
						</button>

						<button
							onclick={clearImage}
							class="neo-button bg-white"
							disabled={uploadState.is_uploading}
							class:opacity-50={uploadState.is_uploading}
							class:cursor-not-allowed={uploadState.is_uploading}
						>
							Change Image
						</button>
					</div>

					{#if uploadState.file}
						<p class="text-sm text-gray-600 mt-4">
							File: {uploadState.file.name} ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
						</p>
					{/if}
				</div>
			{/if}
		</div>

		{#if moodAnalysis}
			<div class="mt-6">
				<MoodAnalysisDisplay analysis={moodAnalysis} onGeneratePlaylist={handleGeneratePlaylist} />
			</div>
		{/if}

		<div class="mt-6 text-center">
			<a href="/dashboard" class="text-lg hover:underline"> ← Back to Dashboard </a>
		</div>
	</div>
</div>
