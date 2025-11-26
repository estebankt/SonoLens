<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type {
		ImageUploadState,
		MoodAnalysis,
		AnalyzeImageResponse,
		GeneratePlaylistResponse,
		SpotifyTrack
	} from '$lib/types/phase2';
	import { fileToBase64, fileToBase64ForAI } from '$lib/utils/image';
	import MoodAnalysisDisplay from '$lib/components/MoodAnalysisDisplay.svelte';
	import PlaylistDisplay from '$lib/components/PlaylistDisplay.svelte';
	import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let uploadState = $state<ImageUploadState>({
		file: null,
		preview_url: null,
		is_uploading: false,
		error: null
	});

	let moodAnalysis = $state<MoodAnalysis | null>(null);
	let generatedTracks = $state<SpotifyTrack[] | null>(null);
	let editableTracks = $state<SpotifyTrack[] | null>(null); // Editable copy for track removal/replacement
	let isGeneratingPlaylist = $state(false);
	let playlistError = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement>();
	let imageBase64 = $state<string | null>(null); // Store base64 image for playlist cover

	// Save playlist state
	let isSavingPlaylist = $state(false);
	let saveError = $state<string | null>(null);
	let savedPlaylist = $state<{ id: string; name: string; url: string; uri: string } | null>(null);

	// Wizard State
	let currentStep = $state(0);
	let direction = $state(1); // 1 for next, -1 for back

	function goToStep(step: number) {
		direction = step > currentStep ? 1 : -1;
		currentStep = step;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goBack() {
		if (currentStep > 0) {
			goToStep(currentStep - 1);
		}
	}

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

	function startOver() {
		uploadState = {
			file: null,
			preview_url: null,
			is_uploading: false,
			error: null
		};
		moodAnalysis = null;
		generatedTracks = null;
		editableTracks = null;
		playlistError = null;
		saveError = null;
		savedPlaylist = null;
		isSavingPlaylist = false;
		isGeneratingPlaylist = false;
		imageBase64 = null;
		if (fileInput) {
			fileInput.value = '';
		}
		goToStep(0);
	}

	// Progress indicator steps synced with currentStep
	let steps = $derived<Array<{ label: string; status: 'completed' | 'current' | 'upcoming' }>>([
		{
			label: 'Upload Image',
			status: currentStep > 0 ? 'completed' : 'current'
		},
		{
			label: 'Analyze Mood',
			status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming'
		},
		{
			label: 'Generate Playlist',
			status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming'
		},
		{
			label: 'Save to Spotify',
			status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming'
		}
	]);

	async function handleAnalyze() {
		if (!uploadState.file || !uploadState.preview_url) return;

		uploadState.is_uploading = true;
		uploadState.error = null;

		try {
			// Convert file to base64 - two versions:
			// 1. Compressed/downscaled for AI analysis (saves tokens)
			// 2. Original quality for playlist cover
			const [compressedBase64, fullQualityBase64] = await Promise.all([
				fileToBase64ForAI(uploadState.file),
				fileToBase64(uploadState.file)
			]);

			// Store full quality image for playlist cover
			imageBase64 = fullQualityBase64;

			// Call API to analyze image with compressed version
			const response = await fetch('/api/analyze-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					image: compressedBase64,
					image_type: 'image/jpeg' // Always JPEG after compression
				})
			});

			const data: AnalyzeImageResponse = await response.json();

			if (!data.success || !data.mood_analysis) {
				throw new Error(data.error || 'Failed to analyze image');
			}

			moodAnalysis = data.mood_analysis;
			goToStep(1);
		} catch (error) {
			console.error('Error analyzing image:', error);
			uploadState.error =
				error instanceof Error ? error.message : 'Failed to analyze image. Please try again.';
		} finally {
			uploadState.is_uploading = false;
		}
	}

	async function handleGeneratePlaylist() {
		if (!moodAnalysis) return;

		isGeneratingPlaylist = true;
		playlistError = null;

		try {
			// Call API to generate playlist
			const response = await fetch('/api/spotify/recommend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					mood_analysis: moodAnalysis,
					limit: 20
				})
			});

			const data: GeneratePlaylistResponse = await response.json();

			if (!data.success || !data.tracks) {
				throw new Error(data.error || 'Failed to generate playlist');
			}

			generatedTracks = data.tracks;
			editableTracks = [...data.tracks]; // Create editable copy
			goToStep(2);
		} catch (error) {
			console.error('Error generating playlist:', error);
			playlistError =
				error instanceof Error ? error.message : 'Failed to generate playlist. Please try again.';
		} finally {
			isGeneratingPlaylist = false;
		}
	}

	function handleRemoveTrack(trackId: string) {
		if (!editableTracks) return;
		editableTracks = editableTracks.filter((track) => track.id !== trackId);
	}

	function handleReorderTracks(reorderedTracks: SpotifyTrack[]) {
		editableTracks = reorderedTracks;
	}

	function handleAddTrack(track: SpotifyTrack) {
		if (!editableTracks) return;
		// Insert at the beginning of the playlist
		editableTracks = [track, ...editableTracks];
	}

	async function handleSavePlaylist() {
		if (!moodAnalysis || !editableTracks || editableTracks.length === 0) {
			console.error('Cannot save playlist: missing analysis or tracks');
			return;
		}

		isSavingPlaylist = true;
		saveError = null;
		savedPlaylist = null;

		try {
			// Extract track URIs from editable tracks (not original generated tracks)
			const trackUris = editableTracks.map((track) => track.uri);

			console.log('═══════════════════════════════════════════════════');
			console.log('💾 SAVING PLAYLIST TO SPOTIFY');
			console.log('═══════════════════════════════════════════════════');
			console.log('Title:', moodAnalysis.suggested_playlist_title);
			console.log('Tracks:', trackUris.length);

			// Call API to create playlist
			const response = await fetch('/api/spotify/create-playlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: moodAnalysis.suggested_playlist_title,
					description: `Created with SonoLens - A ${moodAnalysis.atmosphere} playlist inspired by your image`,
					track_uris: trackUris,
					is_public: true,
					cover_image: imageBase64 // Send base64 image for playlist cover
				})
			});

			const data = await response.json();

			if (!data.success || !data.playlist) {
				throw new Error(data.error || 'Failed to save playlist to Spotify');
			}

			savedPlaylist = data.playlist;
			goToStep(3);

			console.log('✅ SUCCESS: Playlist saved to Spotify');
			console.log('Playlist ID:', data.playlist.id);
			console.log('Playlist URL:', data.playlist.url);
			console.log('═══════════════════════════════════════════════════');
		} catch (error) {
			console.error('Error saving playlist:', error);
			saveError =
				error instanceof Error ? error.message : 'Failed to save playlist. Please try again.';
		} finally {
			isSavingPlaylist = false;
		}
	}
</script>

<div class="min-h-screen p-4 sm:p-8 overflow-x-hidden">
	<div class="max-w-3xl mx-auto">
		<!-- Header with Navigation -->
		<div class="mb-6 relative z-20">
			<div class="flex items-center justify-between gap-2 sm:gap-4 min-h-[3.5rem]">
				<!-- Left: Back Button -->
				<div class="flex-1 flex justify-start">
					{#if currentStep > 0}
						<button
							onclick={goBack}
							class="neo-button p-1 sm:p-2 text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2"
							aria-label="Go back to previous step"
						>
							<span>←</span> <span class="hidden sm:inline">BACK</span>
						</button>
					{/if}
				</div>

				<!-- Center: Title & Subtitle -->
				<div class="flex-none text-center">
					<h1 class="text-2xl sm:text-5xl mb-1 sm:mb-2 font-bold whitespace-nowrap">
						Create Playlist
					</h1>
					<p class="text-lg text-gray-600 hidden sm:block">
						Upload an image to generate a mood-based playlist
					</p>
				</div>

				<!-- Right: Start Over Button -->
				<div class="flex-1 flex justify-end">
					{#if currentStep > 0 || uploadState.preview_url}
						<button
							onclick={startOver}
							class="neo-button text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 font-bold whitespace-nowrap"
							title="Start over from scratch"
						>
							<span class="sm:hidden">RESTART</span>
							<span class="hidden sm:inline">START OVER</span>
						</button>
					{/if}
				</div>
			</div>
			<!-- Mobile Subtitle -->
			<p class="text-sm sm:text-lg text-gray-600 text-center sm:hidden mt-2">
				Upload an image to generate a mood-based playlist
			</p>
		</div>

		<!-- Progress Indicator -->
		<ProgressIndicator {steps} />

		<!-- Wizard Container -->
		<div class="relative grid grid-cols-1 grid-rows-1">
			<!-- Step 0: Upload & Preview -->
			{#if currentStep === 0}
				<div
					class="w-full grid-area-stack"
					in:fly={{ x: 50 * direction, duration: 300, delay: 300, easing: cubicOut }}
					out:fly={{ x: -50 * direction, duration: 300, easing: cubicOut }}
				>
					<div class="neo-card">
						{#if !uploadState.preview_url}
							<!-- Upload Area -->
							<div class="text-center" role="region" aria-label="Image upload section">
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
										aria-label="Select or capture an image file"
									/>

									<div class="flex flex-col sm:flex-row gap-3 justify-center">
										<label for="file-input" class="neo-button cursor-pointer"> Choose File </label>

										<label for="file-input" class="neo-button cursor-pointer"> Take Photo </label>
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
										<LoadingSpinner message="Analyzing Image..." />
										<p class="text-sm mt-3">AI is extracting mood and atmosphere from your image</p>

										<!-- Progress Bar -->
										<div class="w-full bg-white border-4 border-black h-8 overflow-hidden mt-4">
											<div class="h-full bg-black animate-pulse" style="width: 100%"></div>
										</div>
									</div>
								{/if}

								<div class="flex flex-col sm:flex-row gap-3">
									<button
										onclick={handleAnalyze}
										disabled={uploadState.is_uploading}
										class="neo-button flex-1 bg-green-400"
										class:opacity-50={uploadState.is_uploading}
										class:cursor-not-allowed={uploadState.is_uploading}
									>
										{uploadState.is_uploading ? 'Analyzing...' : 'Analyze Image →'}
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
										File: {uploadState.file.name} ({(uploadState.file.size / 1024 / 1024).toFixed(
											2
										)} MB)
									</p>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Step 1: Analysis Results -->
			{#if currentStep === 1 && moodAnalysis}
				<div
					class="w-full grid-area-stack"
					in:fly={{ x: 50 * direction, duration: 300, delay: 300, easing: cubicOut }}
					out:fly={{ x: -50 * direction, duration: 300, easing: cubicOut }}
				>
					<div class="mt-2">
						<MoodAnalysisDisplay
							analysis={moodAnalysis}
							onGeneratePlaylist={handleGeneratePlaylist}
							isGenerating={isGeneratingPlaylist}
						/>
					</div>

					{#if playlistError}
						<div class="mt-6 p-4 bg-red-100 border-4 border-red-500 text-red-700">
							<p class="font-bold">Error generating playlist:</p>
							<p>{playlistError}</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Step 2: Playlist & Edit -->
			{#if currentStep === 2 && editableTracks && moodAnalysis}
				<div
					class="w-full grid-area-stack"
					in:fly={{ x: 50 * direction, duration: 300, delay: 300, easing: cubicOut }}
					out:fly={{ x: -50 * direction, duration: 300, easing: cubicOut }}
				>
					<div class="mt-2">
						{#if editableTracks.length === 0}
							<EmptyState
								title="No Tracks in Playlist"
								description="You've removed all tracks from the playlist. Generate a new playlist or start over."
								icon="music"
								actionLabel="Generate New Playlist"
								onAction={handleGeneratePlaylist}
							/>
						{:else}
							<PlaylistDisplay
								title={moodAnalysis.suggested_playlist_title}
								tracks={editableTracks}
								onSavePlaylist={handleSavePlaylist}
								onRemoveTrack={handleRemoveTrack}
								onReorderTracks={handleReorderTracks}
								onAddTrack={handleAddTrack}
								isLoading={isSavingPlaylist}
								isEditable={true}
							/>
						{/if}
					</div>

					{#if saveError}
						<div class="mt-6 p-4 bg-red-100 border-4 border-red-500 text-red-700">
							<p class="font-bold">Error saving playlist:</p>
							<p>{saveError}</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Step 3: Success -->
			{#if currentStep === 3 && savedPlaylist}
				<div
					class="w-full grid-area-stack"
					in:fly={{ x: 50 * direction, duration: 300, delay: 300, easing: cubicOut }}
					out:fly={{ x: -50 * direction, duration: 300, easing: cubicOut }}
				>
					<div class="mt-6 p-6 bg-green-100 border-4 border-green-600 neo-card">
						<div class="flex items-center gap-3 mb-4">
							<svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<h3 class="text-2xl font-bold">Playlist Saved to Spotify!</h3>
						</div>
						<p class="mb-6 text-lg">
							<strong>{savedPlaylist.name}</strong> has been added to your Spotify library.
						</p>
						<div class="flex flex-col sm:flex-row gap-4">
							<a
								href={savedPlaylist.url}
								target="_blank"
								rel="noopener noreferrer"
								class="neo-button bg-green-500 text-white border-green-700 text-center px-6"
							>
								Open in Spotify
							</a>
							<a href="/dashboard" class="neo-button bg-white text-center px-6">
								Back to Dashboard
							</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Helper class for grid overlap */
	.grid-area-stack {
		grid-area: 1 / 1 / 2 / 2;
	}
</style>
