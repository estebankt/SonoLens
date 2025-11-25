<script lang="ts">
	import type { SpotifyTrack } from '$lib/types/phase2';

	interface Props {
		title: string;
		tracks: SpotifyTrack[];
		onSavePlaylist?: () => void;
		isLoading?: boolean;
	}

	let { title, tracks, onSavePlaylist, isLoading = false }: Props = $props();

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
	<div class="mb-6">
		<h2 class="text-3xl sm:text-4xl font-bold mb-2">{title}</h2>
		<p class="text-lg text-gray-600">
			{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} • {calculateTotalDuration(tracks)}
		</p>
	</div>

	<!-- Track List -->
	<div class="space-y-2 mb-6">
		{#each tracks as track, index}
			<div
				class="flex items-center gap-3 p-3 bg-white border-2 border-black hover:bg-gray-50 transition-colors"
			>
				<!-- Track Number -->
				<div class="flex-shrink-0 w-8 text-center">
					<span class="text-lg font-bold text-gray-500">{index + 1}</span>
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

				<!-- Spotify Link -->
				<a
					href={track.external_urls.spotify}
					target="_blank"
					rel="noopener noreferrer"
					class="flex-shrink-0 p-2 hover:bg-gray-200 border-2 border-black transition-colors"
					title="Open in Spotify"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
						/>
					</svg>
				</a>
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
