<script lang="ts">
	import { onMount } from 'svelte';
	import type { SpotifyTrack } from '$lib/types/phase2';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface AddTrackModalProps {
		isOpen: boolean;
		existingTrackIds: string[];
		onAddTrack: (track: SpotifyTrack) => void;
		onClose: () => void;
	}

	let { isOpen, existingTrackIds, onAddTrack, onClose }: AddTrackModalProps = $props();

	// State
	let searchQuery = $state('');
	let searchResults = $state<SpotifyTrack[]>([]);
	let isSearching = $state(false);
	let error = $state<string | null>(null);
	let searchInputElement = $state<HTMLInputElement>();

	// Debouncing
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Search effect with debouncing
	$effect(() => {
		// Clear previous timeout
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		// Clear results if query is empty
		if (searchQuery.trim().length === 0) {
			searchResults = [];
			error = null;
			return;
		}

		// Set new timeout for debounced search
		debounceTimeout = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);

		// Cleanup
		return () => {
			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
			}
		};
	});

	// Focus input when modal opens
	$effect(() => {
		if (isOpen && searchInputElement) {
			setTimeout(() => searchInputElement?.focus(), 100);
		}
	});

	async function performSearch(query: string) {
		isSearching = true;
		error = null;

		try {
			const response = await fetch(`/api/spotify/search-tracks?q=${encodeURIComponent(query)}`);
			const data = await response.json();

			if (data.success) {
				searchResults = data.tracks;
			} else {
				error = data.error || 'Search failed';
				searchResults = [];
			}
		} catch (err) {
			console.error('Search error:', err);
			error = 'Network error. Please try again.';
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function isTrackInPlaylist(trackId: string): boolean {
		return existingTrackIds.includes(trackId);
	}

	function formatDuration(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function handleAddTrack(track: SpotifyTrack) {
		if (isTrackInPlaylist(track.id)) return;
		onAddTrack(track);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		onclick={handleOverlayClick}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			class="bg-white border-4 border-black w-full max-w-2xl max-h-[80vh] flex flex-col"
			style="box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);"
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b-4 border-black">
				<h2 id="modal-title" class="text-2xl font-bold">Add Track to Playlist</h2>
				<button
					onclick={onClose}
					class="p-2 hover:bg-gray-100 border-2 border-black transition-colors"
					aria-label="Close modal"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Search Input -->
			<div class="p-4 border-b-4 border-black">
				<input
					bind:this={searchInputElement}
					bind:value={searchQuery}
					type="text"
					placeholder="Search for tracks..."
					class="neo-input w-full text-lg"
					aria-label="Search for tracks"
				/>
			</div>

			<!-- Results Area -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if searchQuery.trim().length === 0}
					<!-- Empty state - no query -->
					<div class="text-center py-12">
						<svg
							class="w-16 h-16 mx-auto mb-4 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<p class="text-lg text-gray-600">Start typing to search for tracks</p>
					</div>
				{:else if isSearching}
					<!-- Loading state -->
					<div class="text-center py-12">
						<LoadingSpinner size="lg" message="Searching..." centered={true} />
					</div>
				{:else if error}
					<!-- Error state -->
					<div class="p-4 bg-red-100 border-4 border-red-500 text-red-700">
						<p class="font-bold">Error</p>
						<p>{error}</p>
					</div>
				{:else if searchResults.length === 0}
					<!-- No results -->
					<div class="text-center py-12">
						<p class="text-lg text-gray-600">
							No results found for "<strong>{searchQuery}</strong>"
						</p>
					</div>
				{:else}
					<!-- Search results -->
					<div class="space-y-2" role="list">
						{#each searchResults as track (track.id)}
							{@const isDuplicate = isTrackInPlaylist(track.id)}
							<div
								role="listitem"
								class="flex items-center gap-4 p-4 bg-white border-2 border-black transition-colors"
								class:opacity-50={isDuplicate}
								class:cursor-not-allowed={isDuplicate}
								class:hover:bg-gray-50={!isDuplicate}
							>
								<!-- Album Art -->
								{#if track.album.images && track.album.images.length > 0}
									<img
										src={track.album.images[track.album.images.length - 1].url}
										alt={track.album.name}
										class="w-20 h-20 border-4 border-black flex-shrink-0"
									/>
								{/if}

								<!-- Track Info -->
								<div class="flex-1 min-w-0">
									<h3 class="font-bold text-lg truncate">{track.name}</h3>
									<p class="text-base text-gray-600 truncate">
										{track.artists.map((a) => a.name).join(', ')}
									</p>
								</div>

								<!-- Duration -->
								<div class="hidden sm:block flex-shrink-0 text-sm text-gray-600">
									{formatDuration(track.duration_ms)}
								</div>

								<!-- Action Button -->
								<div class="flex-shrink-0">
									{#if isDuplicate}
										<span
											class="px-3 py-2 bg-gray-200 border-2 border-black text-sm font-bold text-gray-600"
										>
											In Playlist
										</span>
									{:else}
										<button
											onclick={() => handleAddTrack(track)}
											class="neo-button bg-green-400 text-black px-4 py-2 text-sm"
											aria-label="Add {track.name} to playlist"
										>
											Add
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="p-4 border-t-4 border-black flex justify-end">
				<button onclick={onClose} class="neo-button bg-white px-6 py-2"> Close </button>
			</div>
		</div>
	</div>
{/if}
