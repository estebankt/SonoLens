<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { SpotifyTrack } from '$lib/types/phase2';
	import SpotifyWebPlayer from './SpotifyWebPlayer.svelte';
	import AddTrackModal from './AddTrackModal.svelte';

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

	function handleTrackChange(newIndex: number) {
		currentTrackIndex = newIndex;
	}

	function handlePlayTrack(index: number) {
		currentTrackIndex = index;
	}

	// Drag and Drop handlers
	function handleDragStart(event: DragEvent, index: number) {
		if (!isEditable || !onReorderTracks) return;

		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', index.toString());
		}
	}

	function handleDragOver(event: DragEvent, index: number) {
		if (!isEditable || !onReorderTracks || draggedIndex === null) return;

		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		dragOverIndex = index;
	}

	function handleDragLeave() {
		dragOverIndex = null;
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

		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
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

<div class="neo-card">
	<!-- Playlist Header -->
	<div class="mb-6 flex items-start justify-between gap-4">
		<div class="flex-1">
			<h2 class="text-3xl sm:text-4xl font-bold mb-2">{title}</h2>
			<p class="text-lg text-gray-600">
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
		{#each tracks as track, index (track.id)}
			<div
				role="listitem"
				draggable={isEditable && !!onReorderTracks}
				ondragstart={(e) => handleDragStart(e, index)}
				ondragover={(e) => handleDragOver(e, index)}
				ondragleave={handleDragLeave}
				ondrop={(e) => handleDrop(e, index)}
				ondragend={handleDragEnd}
				ondblclick={() => handlePlayTrack(index)}
				transition:fly={{ y: -20, duration: 300 }}
				class="flex items-center gap-3 p-3 bg-white border-2 border-black transition-colors"
				class:hover:bg-gray-50={draggedIndex === null}
				class:bg-yellow-100={currentTrackIndex === index && draggedIndex !== index}
				class:border-yellow-600={currentTrackIndex === index && draggedIndex !== index}
				class:border-4={currentTrackIndex === index && draggedIndex !== index}
				class:opacity-50={draggedIndex === index}
				class:bg-blue-50={dragOverIndex === index && draggedIndex !== index}
				class:border-blue-500={dragOverIndex === index && draggedIndex !== index}
				class:border-dashed={dragOverIndex === index && draggedIndex !== index}
				class:cursor-move={isEditable && !!onReorderTracks}
			>
				<!-- Drag Handle (only show if reordering is enabled) -->
				{#if isEditable && onReorderTracks}
					<div
						class="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600"
						title="Drag to reorder"
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
							/>
						</svg>
					</div>
				{/if}

				<!-- Track Number / Play Button -->
				<div class="flex-shrink-0 w-8 text-center">
					{#if currentTrackIndex === index}
						<button
							onclick={() => handlePlayTrack(index)}
							class="text-yellow-600"
							title="Currently playing"
						>
							<svg class="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					{:else}
						<button
							onclick={() => handlePlayTrack(index)}
							class="text-gray-500 hover:text-black"
							title="Play track"
						>
							<span class="text-lg font-bold">{index + 1}</span>
						</button>
					{/if}
				</div>

				<!-- Album Art -->
				{#if track.album.images && track.album.images.length > 0}
					<img
						src={track.album.images[track.album.images.length - 1].url}
						alt={track.album.name}
						class="w-12 h-12 border-2 border-black flex-shrink-0"
					/>
				{/if}

				<!-- Track Info -->
				<div class="flex-grow min-w-0">
					<h3 class="font-bold truncate">{track.name}</h3>
					<p class="text-sm text-gray-600 truncate">
						{track.artists.map((a) => a.name).join(', ')}
					</p>
				</div>

				<!-- Duration -->
				<div class="hidden sm:block flex-shrink-0 text-sm text-gray-600">
					{formatDuration(track.duration_ms)}
				</div>

				<!-- Action Buttons -->
				<div class="flex items-center gap-2 flex-shrink-0">
					<!-- Spotify Link -->
					<a
						href={track.external_urls.spotify}
						target="_blank"
						rel="noopener noreferrer"
						class="p-2 hover:bg-gray-200 border-2 border-black transition-colors"
						title="Open in Spotify"
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
							/>
						</svg>
					</a>

					{#if isEditable}
						<!-- Remove Button -->
						{#if onRemoveTrack}
							<button
								onclick={() => onRemoveTrack(track.id)}
								class="p-2 hover:bg-red-100 border-2 border-black transition-colors"
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
