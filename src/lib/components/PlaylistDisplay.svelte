<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { SpotifyTrack } from '$lib/types/phase2';
	import SpotifyWebPlayer from './SpotifyWebPlayer.svelte';
	import AddTrackModal from './AddTrackModal.svelte';
	import { makeScroller } from '$lib/utils/scroller';

	interface Props {
		title: string;
		tracks: SpotifyTrack[];
		onSavePlaylist?: () => void;
		onRemoveTrack?: (trackId: string) => void;
		onReorderTracks?: (reorderedTracks: SpotifyTrack[]) => void;
		onAddTrack?: (track: SpotifyTrack) => void;
		isLoading?: boolean;
		isEditable?: boolean;
	}

	let {
		title,
		tracks,
		onSavePlaylist,
		onRemoveTrack,
		onReorderTracks,
		onAddTrack,
		isLoading = false,
		isEditable = true
	}: Props = $props();

	let currentTrackIndex = $state(0);
	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let showAddTrackModal = $state(false);
	let selectedTrackIndex = $state<number | null>(null);
	let overflowingTitles = $state<Set<number>>(new Set());

	// Auto-scroll state
	let scroller = $state(makeScroller());

	function checkTitleOverflow(node: HTMLElement, index: number) {
		const check = () => {
			const hasOverflow = node.scrollWidth > node.clientWidth;
			if (hasOverflow) {
				overflowingTitles.add(index);
			} else {
				overflowingTitles.delete(index);
			}
			overflowingTitles = overflowingTitles;
		};

		// Check on mount
		check();

		// Re-check on resize
		const resizeObserver = new ResizeObserver(check);
		resizeObserver.observe(node);

		return {
			destroy() {
				resizeObserver.disconnect();
			}
		};
	}

	function handleTrackChange(newIndex: number) {
		currentTrackIndex = newIndex;
	}

	function handlePlayTrack(index: number) {
		currentTrackIndex = index;
	}

	function handleTrackClick(index: number) {
		// Don't trigger click if user was swiping
		if (isSwipeGesture) {
			isSwipeGesture = false;
			return;
		}

		// First click/tap: select the track
		if (selectedTrackIndex !== index) {
			selectedTrackIndex = index;
		} else {
			// Second click/tap on same track: play it
			handlePlayTrack(index);
			selectedTrackIndex = null; // Clear selection after playing
		}
	}

	// Drag and Drop handlers
	function handleDragStart(event: DragEvent, index: number) {
		if (!isEditable || !onReorderTracks) return;

		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', index.toString());

			// Get the track row element
			const target = event.target as HTMLElement;
			const trackRow = target.closest('[role="button"]') as HTMLElement;

			if (trackRow) {
				// Use the track row directly as the drag image
				event.dataTransfer.setDragImage(trackRow, 10, 10);
			}
		}
	}

	function handleDragOver(event: DragEvent, index: number) {
		if (!isEditable || !onReorderTracks || draggedIndex === null) return;

		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		dragOverIndex = index;

		// Trigger auto-scroll when dragging near window edges
		if (scroller) {
			const pointer = { x: event.clientX, y: event.clientY };
			scroller.scrollIfNeeded(pointer, document.documentElement);
		}
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;

		// Stop auto-scrolling
		if (scroller) {
			scroller.resetScrolling();
		}
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		if (!isEditable || !onReorderTracks || draggedIndex === null) return;

		event.preventDefault();

		if (draggedIndex !== dropIndex) {
			const newTracks = [...tracks];
			const [draggedTrack] = newTracks.splice(draggedIndex, 1);
			newTracks.splice(dropIndex, 0, draggedTrack);

			// Update current track index if the playing track was moved
			if (currentTrackIndex === draggedIndex) {
				currentTrackIndex = dropIndex;
			} else if (draggedIndex < currentTrackIndex && dropIndex >= currentTrackIndex) {
				currentTrackIndex -= 1;
			} else if (draggedIndex > currentTrackIndex && dropIndex <= currentTrackIndex) {
				currentTrackIndex += 1;
			}

			onReorderTracks(newTracks);
		}

		// Stop auto-scrolling
		if (scroller) {
			scroller.resetScrolling();
		}

		draggedIndex = null;
		dragOverIndex = null;
	}

	let swipedTrackIndex = $state<number | null>(null);
	let swipeStartX = $state<number | null>(null);
	let currentSwipeOffset = $state(0);
	let isSwipeGesture = $state(false);

	function handleTouchStart(event: TouchEvent, index: number) {
		if (!isEditable || !onRemoveTrack) return;
		swipeStartX = event.touches[0].clientX;
		swipedTrackIndex = index;
		currentSwipeOffset = 0;
		isSwipeGesture = false;
	}

	function handleTouchMove(event: TouchEvent) {
		if (swipeStartX === null || swipedTrackIndex === null) return;

		const currentX = event.touches[0].clientX;
		const diff = currentX - swipeStartX;

		// Only allow swiping left (negative diff)
		if (diff < 0) {
			if (Math.abs(diff) > 10) {
				isSwipeGesture = true; // Mark as swipe if moved more than 10px
			}
			currentSwipeOffset = Math.max(diff, -100); // Limit swipe to -100px
		}
	}

	function handleTouchEnd() {
		if (swipedTrackIndex !== null && onRemoveTrack) {
			// Threshold to trigger delete
			if (currentSwipeOffset < -50) {
				onRemoveTrack(tracks[swipedTrackIndex].id);
			}
		}
		// Reset
		swipeStartX = null;
		swipedTrackIndex = null;
		currentSwipeOffset = 0;
	}

	function formatDuration(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function calculateTotalDuration(tracks: SpotifyTrack[]): string {
		const totalMs = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
		const minutes = Math.floor(totalMs / 60000);
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;

		if (hours > 0) {
			return `${hours} hr ${remainingMinutes} min`;
		}
		return `${minutes} min`;
	}
</script>

<div class="neo-card mb-24">
	<!-- Playlist Header -->
	<div class="mb-6 flex items-start justify-between gap-4">
		<div class="flex-1">
			<h2 class="playlist-title text-xl sm:text-4xl font-bold mb-2">{title}</h2>
			<p class="track-count text-sm sm:text-lg text-gray-600">
				{tracks.length}
				{tracks.length === 1 ? 'track' : 'tracks'} • {calculateTotalDuration(tracks)}
			</p>
		</div>

		{#if isEditable && onAddTrack}
			<button
				onclick={() => (showAddTrackModal = true)}
				class="neo-button bg-yellow-400 text-black px-4 py-2 text-2xl font-bold flex-shrink-0"
				title="Add track to playlist"
				aria-label="Add track to playlist"
			>
				+
			</button>
		{/if}
	</div>

	<!-- Track List -->
	<div class="space-y-2 mb-6" role="list">
		{#each tracks as track, index (index)}
			<div class="relative overflow-hidden" transition:fly={{ y: -20, duration: 300 }}>
				<!-- Red Background for Swipe Delete -->
				{#if isEditable && onRemoveTrack}
					<div class="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</div>
				{/if}

				<div
					role="button"
					tabindex="0"
					onclick={() => handleTrackClick(index)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTrackClick(index)}
					ondragover={(e) => handleDragOver(e, index)}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, index)}
					ondblclick={() => handlePlayTrack(index)}
					ontouchstart={(e) => handleTouchStart(e, index)}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
					style="transform: translateX({swipedTrackIndex === index ? currentSwipeOffset : 0}px)"
					class="relative flex items-center gap-6 p-4 border-2 transition-colors touch-pan-y cursor-pointer"
					aria-label={`${selectedTrackIndex === index ? 'Selected' : 'Select'} track: ${track.name} by ${track.artists.map((a) => a.name).join(', ')}`}
					class:bg-white={draggedIndex !== index &&
						selectedTrackIndex !== index &&
						currentTrackIndex !== index &&
						dragOverIndex !== index}
					class:hover:bg-gray-50={draggedIndex === null &&
						selectedTrackIndex !== index &&
						currentTrackIndex !== index &&
						dragOverIndex !== index}
					class:bg-yellow-100={currentTrackIndex === index && draggedIndex !== index}
					class:border-yellow-600={currentTrackIndex === index && draggedIndex !== index}
					class:bg-blue-100={selectedTrackIndex === index &&
						currentTrackIndex !== index &&
						draggedIndex !== index}
					class:border-blue-600={selectedTrackIndex === index &&
						currentTrackIndex !== index &&
						draggedIndex !== index}
					class:border-black={selectedTrackIndex !== index &&
						currentTrackIndex !== index &&
						dragOverIndex !== index}
					class:border-4={currentTrackIndex === index && draggedIndex !== index}
					class:border-2={currentTrackIndex !== index || draggedIndex === index}
					class:opacity-50={draggedIndex === index}
					class:bg-blue-50={dragOverIndex === index &&
						draggedIndex !== index &&
						selectedTrackIndex !== index &&
						currentTrackIndex !== index}
					class:border-blue-500={dragOverIndex === index && draggedIndex !== index}
					class:border-dashed={dragOverIndex === index && draggedIndex !== index}
				>
					<!-- Drag Handle (only show if reordering is enabled) -->
					{#if isEditable && onReorderTracks}
						<div
							role="button"
							tabindex="0"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, index)}
							ondragend={handleDragEnd}
							class="hidden sm:block flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
							title="Drag to reorder"
							aria-label="Drag to reorder track"
						>
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
								/>
							</svg>
						</div>
					{/if}

					<!-- Track Number / Play Button -->
					<div class="hidden sm:block flex-shrink-0 w-8 text-center">
						<button
							onclick={() => handlePlayTrack(index)}
							class="text-gray-500 hover:text-black w-full h-full flex items-center justify-center"
							title="Play track"
						>
							<span class="text-lg font-bold" class:text-yellow-600={currentTrackIndex === index}>
								{index + 1}
							</span>
						</button>
					</div>

					<!-- Album Art -->
					<div class="relative flex-shrink-0 p-2">
						{#if track.album.images && track.album.images.length > 0}
							<img
								src={track.album.images[track.album.images.length - 1].url}
								alt={track.album.name}
								class="w-16 h-16 border-4 border-black"
							/>
						{/if}
						{#if currentTrackIndex === index}
							<div class="absolute inset-0 flex items-center justify-center bg-black/30">
								<svg
									class="w-8 h-8 text-yellow-400 animate-pulse"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						{/if}
					</div>

					<!-- Track Info -->
					<div class="flex-grow min-w-0">
						<div
							class="marquee-container"
							class:marquee-active={selectedTrackIndex === index && overflowingTitles.has(index)}
						>
							<h3
								class="marquee-content track-title font-bold text-sm sm:text-lg"
								data-text={track.name}
								use:checkTitleOverflow={index}
							>
								{track.name}
							</h3>
						</div>
						<p class="track-artist text-xs sm:text-base text-gray-600 truncate">
							{track.artists.map((a) => a.name).join(', ')}
						</p>
					</div>

					<!-- Duration -->
					<div class="hidden sm:block flex-shrink-0 text-sm text-gray-600">
						{formatDuration(track.duration_ms)}
					</div>

					<!-- Action Buttons -->
					<div class="flex items-center gap-2 flex-shrink-0">
						{#if isEditable}
							<!-- Remove Button -->
							{#if onRemoveTrack}
								<button
									onclick={() => onRemoveTrack(track.id)}
									class="hidden sm:block p-2 hover:bg-red-100 border-2 border-black transition-colors"
									title="Remove track"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Save Button -->
	{#if onSavePlaylist}
		<div class="flex justify-center">
			<button
				onclick={onSavePlaylist}
				disabled={isLoading}
				class="neo-button text-xl px-8 py-4"
				class:opacity-50={isLoading}
				class:cursor-not-allowed={isLoading}
			>
				{isLoading ? 'Saving...' : 'Save to Spotify'}
			</button>
		</div>
	{/if}
</div>

<!-- Add Track Modal -->
{#if onAddTrack}
	<AddTrackModal
		isOpen={showAddTrackModal}
		existingTrackIds={tracks.map((t) => t.id)}
		onAddTrack={(track) => {
			onAddTrack(track);
			showAddTrackModal = false;
		}}
		onClose={() => (showAddTrackModal = false)}
	/>
{/if}

<!-- Spotify Web Player -->
<SpotifyWebPlayer {tracks} {currentTrackIndex} onTrackChange={handleTrackChange} />

<style>
	@keyframes marquee {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	.marquee-container {
		overflow: hidden;
		position: relative;
		width: 100%;
	}

	.marquee-content {
		display: inline-block;
		white-space: nowrap;
		/* No animation by default */
	}

	/* Only animate when track is selected */
	.marquee-active .marquee-content {
		animation: marquee 15s linear infinite;
		padding-right: 2rem;
	}

	.marquee-active .marquee-content::after {
		content: attr(data-text);
		padding-left: 2rem;
	}

	.marquee-container:hover .marquee-content {
		animation-play-state: paused;
	}

	/* When not animating, show truncate behavior */
	.marquee-content:not(.marquee-active .marquee-content) {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Mobile font sizes - override Tailwind on mobile */
	@media (max-width: 768px) {
		.playlist-title {
			font-size: 2.25rem; /* 18px */
		}

		.track-title {
			font-size: 1.125rem; /* 14px */
		}

		.track-artist {
			font-size: 0.75rem; /* 12px */
		}

		.track-count {
			font-size: 0.875rem; /* 14px */
		}
	}
</style>
