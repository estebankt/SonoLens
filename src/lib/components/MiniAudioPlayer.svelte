<script lang="ts">
	import type { SpotifyTrack } from '$lib/types/phase2';

	interface MiniAudioPlayerProps {
		tracks: SpotifyTrack[];
		currentTrackIndex?: number;
		onTrackChange?: (index: number) => void;
	}

	let { tracks, currentTrackIndex = 0, onTrackChange }: MiniAudioPlayerProps = $props();

	// Player state
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(0.7);
	let showVolumeSlider = $state(false);
	let audioElement = $state<HTMLAudioElement>();
	let currentIndex = $state(currentTrackIndex);

	// Computed values
	let currentTrack = $derived(tracks[currentIndex] || null);
	let hasPreview = $derived(
		currentTrack?.preview_url !== null && currentTrack?.preview_url !== undefined
	);
	let canPlayPrevious = $derived(currentIndex > 0);
	let canPlayNext = $derived(currentIndex < tracks.length - 1);

	// Update current index when prop changes
	$effect(() => {
		currentIndex = currentTrackIndex;
	});

	// Notify parent when track changes
	$effect(() => {
		if (onTrackChange && currentIndex !== currentTrackIndex) {
			onTrackChange(currentIndex);
		}
	});

	// Auto-play next track when current ends
	function handleTrackEnded() {
		if (canPlayNext) {
			playNext();
		} else {
			isPlaying = false;
		}
	}

	// Time update handler
	function handleTimeUpdate() {
		if (audioElement) {
			currentTime = audioElement.currentTime;
			duration = audioElement.duration || 0;
		}
	}

	// Volume change handler
	function handleVolumeChange() {
		if (audioElement) {
			audioElement.volume = volume;
		}
	}

	// Seek handler
	function handleSeek(event: Event) {
		const target = event.target as HTMLInputElement;
		const newTime = parseFloat(target.value);
		if (audioElement) {
			audioElement.currentTime = newTime;
			currentTime = newTime;
		}
	}

	// Play/Pause toggle
	function togglePlayPause() {
		if (!hasPreview) {
			console.warn('No preview available for this track');
			return;
		}

		if (isPlaying) {
			audioElement?.pause();
			isPlaying = false;
		} else {
			audioElement
				?.play()
				.then(() => {
					isPlaying = true;
				})
				.catch((error) => {
					console.error('Error playing audio:', error);
					isPlaying = false;
				});
		}
	}

	// Play next track (skip tracks without previews)
	function playNext() {
		if (canPlayNext) {
			currentIndex += 1;
			isPlaying = false;
			currentTime = 0;

			// If the new track doesn't have a preview, skip to the next one
			const maxAttempts = tracks.length;
			let attempts = 0;
			while (
				attempts < maxAttempts &&
				!tracks[currentIndex]?.preview_url &&
				currentIndex < tracks.length - 1
			) {
				currentIndex += 1;
				attempts++;
			}

			// Small delay to allow audio element to update
			setTimeout(() => {
				const trackHasPreview = tracks[currentIndex]?.preview_url;
				if (trackHasPreview) {
					audioElement
						?.play()
						.then(() => {
							isPlaying = true;
						})
						.catch((error) => {
							console.error('Error playing next track:', error);
							isPlaying = false;
						});
				}
			}, 100);
		}
	}

	// Play previous track (skip tracks without previews)
	function playPrevious() {
		if (canPlayPrevious) {
			currentIndex -= 1;
			isPlaying = false;
			currentTime = 0;

			// If the new track doesn't have a preview, skip to the previous one
			const maxAttempts = tracks.length;
			let attempts = 0;
			while (attempts < maxAttempts && !tracks[currentIndex]?.preview_url && currentIndex > 0) {
				currentIndex -= 1;
				attempts++;
			}

			// Small delay to allow audio element to update
			setTimeout(() => {
				const trackHasPreview = tracks[currentIndex]?.preview_url;
				if (trackHasPreview) {
					audioElement
						?.play()
						.then(() => {
							isPlaying = true;
						})
						.catch((error) => {
							console.error('Error playing previous track:', error);
							isPlaying = false;
						});
				}
			}, 100);
		}
	}

	// Keyboard controls
	function handleKeydown(event: KeyboardEvent) {
		// Only handle if not typing in an input
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		switch (event.key) {
			case ' ':
			case 'k':
				event.preventDefault();
				togglePlayPause();
				break;
			case 'ArrowRight':
			case 'l':
				event.preventDefault();
				if (canPlayNext) playNext();
				break;
			case 'ArrowLeft':
			case 'j':
				event.preventDefault();
				if (canPlayPrevious) playPrevious();
				break;
			case 'm':
				event.preventDefault();
				volume = volume === 0 ? 0.7 : 0;
				handleVolumeChange();
				break;
		}
	}

	// Format time (seconds to MM:SS)
	function formatTime(seconds: number): string {
		if (!isFinite(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Apply volume when audio element changes
	$effect(() => {
		if (audioElement) {
			audioElement.volume = volume;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="neo-card bg-black text-white sticky bottom-0 z-50">
	<!-- Hidden audio element -->
	{#if currentTrack && hasPreview}
		<audio
			bind:this={audioElement}
			src={currentTrack.preview_url}
			ontimeupdate={handleTimeUpdate}
			onended={handleTrackEnded}
			onloadedmetadata={handleTimeUpdate}
		></audio>
	{/if}

	<div class="p-4">
		{#if !currentTrack}
			<div class="text-center text-gray-400">
				<p>No track selected</p>
			</div>
		{:else}
			<!-- Track info -->
			<div class="flex items-center gap-4 mb-3">
				<!-- Album art -->
				{#if currentTrack.album.images[0]}
					<img
						src={currentTrack.album.images[0].url}
						alt={currentTrack.album.name}
						class="w-16 h-16 border-4 border-white"
					/>
				{/if}

				<!-- Track details -->
				<div class="flex-1 min-w-0">
					<p class="font-bold text-lg truncate">{currentTrack.name}</p>
					<p class="text-gray-300 truncate">
						{currentTrack.artists.map((a) => a.name).join(', ')}
					</p>
					{#if !hasPreview}
						<a
							href={currentTrack.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							class="text-yellow-400 text-sm mt-1 hover:text-yellow-300 underline inline-flex items-center gap-1"
						>
							⚠️ No preview - Listen on Spotify
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
								/>
								<path
									d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
								/>
							</svg>
						</a>
					{/if}
				</div>

				<!-- Volume control -->
				<div class="relative">
					<button
						onclick={() => (showVolumeSlider = !showVolumeSlider)}
						class="p-2 hover:bg-gray-800 border-2 border-white transition-colors"
						title="Volume (M to mute)"
					>
						{#if volume === 0}
							<!-- Muted icon -->
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<!-- Volume icon -->
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}
					</button>

					{#if showVolumeSlider}
						<div class="absolute bottom-full right-0 mb-2 p-3 bg-black border-4 border-white">
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								bind:value={volume}
								oninput={handleVolumeChange}
								class="w-24 h-2"
							/>
						</div>
					{/if}
				</div>
			</div>

			<!-- Progress bar -->
			<div class="mb-3">
				<input
					type="range"
					min="0"
					max={duration || 100}
					value={currentTime}
					oninput={handleSeek}
					disabled={!hasPreview}
					class="w-full h-2 bg-white border-2 border-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					class:cursor-pointer={hasPreview}
				/>
				<div class="flex justify-between text-xs text-gray-400 mt-1">
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			<!-- Controls -->
			<div class="flex items-center justify-center gap-3">
				<!-- Previous button -->
				<button
					onclick={playPrevious}
					disabled={!canPlayPrevious}
					class="p-3 bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					title="Previous (J or ←)"
				>
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
						/>
					</svg>
				</button>

				<!-- Play/Pause button -->
				<button
					onclick={togglePlayPause}
					disabled={!hasPreview}
					class="p-4 bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					title={hasPreview
						? isPlaying
							? 'Pause (Space or K)'
							: 'Play (Space or K)'
						: 'No preview available'}
				>
					{#if isPlaying}
						<!-- Pause icon -->
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<!-- Play icon -->
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>

				<!-- Next button -->
				<button
					onclick={playNext}
					disabled={!canPlayNext}
					class="p-3 bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					title="Next (L or →)"
				>
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
						/>
					</svg>
				</button>
			</div>

			<!-- Keyboard shortcuts hint -->
			<div class="text-center text-xs text-gray-500 mt-3">
				<p>
					Keyboard: <span class="text-gray-400">Space/K = Play/Pause</span> •
					<span class="text-gray-400">J/← = Previous</span> •
					<span class="text-gray-400">L/→ = Next</span> •
					<span class="text-gray-400">M = Mute</span>
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom range slider styling for neo-brutalist look */
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background: white;
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: black;
		border: 3px solid white;
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: black;
		border: 3px solid white;
		cursor: pointer;
	}

	input[type='range']:disabled::-webkit-slider-thumb {
		cursor: not-allowed;
	}

	input[type='range']:disabled::-moz-range-thumb {
		cursor: not-allowed;
	}
</style>
