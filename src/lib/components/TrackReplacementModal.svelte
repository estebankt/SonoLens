<script lang="ts">
	import type { SpotifyTrack } from '$lib/types/phase2';

	interface Props {
		isOpen: boolean;
		originalTrack: SpotifyTrack | null;
		suggestions: SpotifyTrack[] | null;
		isLoading: boolean;
		onSelect: (track: SpotifyTrack) => void;
		onCancel: () => void;
	}

	let { isOpen, originalTrack, suggestions, isLoading, onSelect, onCancel }: Props = $props();

	function formatDuration(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

{#if isOpen}
	<!-- Modal Overlay -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		onclick={onCancel}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && onCancel()}
	>
		<!-- Modal Content -->
		<div
			class="bg-white border-4 border-black max-w-2xl w-full max-h-[80vh] overflow-y-auto"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
		>
			<!-- Modal Header -->
			<div class="p-6 border-b-4 border-black bg-yellow-100">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold">Replace Track</h2>
					<button
						onclick={onCancel}
						class="p-2 hover:bg-black hover:text-white border-2 border-black transition-colors"
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

				{#if originalTrack}
					<div class="mt-4 p-4 bg-white border-2 border-black">
						<p class="text-sm font-bold mb-2">Currently selected:</p>
						<div class="flex items-center gap-3">
							{#if originalTrack.album.images && originalTrack.album.images.length > 0}
								<img
									src={originalTrack.album.images[originalTrack.album.images.length - 1].url}
									alt={originalTrack.album.name}
									class="w-12 h-12 border-2 border-black"
								/>
							{/if}
							<div>
								<p class="font-bold">{originalTrack.name}</p>
								<p class="text-sm text-gray-600">
									{originalTrack.artists.map((a) => a.name).join(', ')}
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Body -->
			<div class="p-6">
				{#if isLoading}
					<div class="text-center py-12">
						<div
							class="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"
						></div>
						<p class="text-lg font-bold">Finding similar tracks...</p>
					</div>
				{:else if suggestions && suggestions.length > 0}
					<div>
						<h3 class="text-xl font-bold mb-4">Choose a replacement:</h3>
						<div class="space-y-2">
							{#each suggestions as suggestion}
								<button
									onclick={() => onSelect(suggestion)}
									class="w-full flex items-center gap-3 p-3 bg-white border-2 border-black hover:bg-yellow-100 transition-colors text-left"
								>
									<!-- Album Art -->
									{#if suggestion.album.images && suggestion.album.images.length > 0}
										<img
											src={suggestion.album.images[suggestion.album.images.length - 1].url}
											alt={suggestion.album.name}
											class="w-16 h-16 border-2 border-black flex-shrink-0"
										/>
									{/if}

									<!-- Track Info -->
									<div class="flex-grow min-w-0">
										<h4 class="font-bold truncate">{suggestion.name}</h4>
										<p class="text-sm text-gray-600 truncate">
											{suggestion.artists.map((a) => a.name).join(', ')}
										</p>
										<p class="text-xs text-gray-500 truncate">{suggestion.album.name}</p>
									</div>

									<!-- Duration -->
									<div class="flex-shrink-0 text-sm text-gray-600">
										{formatDuration(suggestion.duration_ms)}
									</div>

									<!-- Preview Icon -->
									<div class="flex-shrink-0">
										<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{:else if suggestions && suggestions.length === 0}
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
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="text-lg font-bold mb-2">No suggestions found</p>
						<p class="text-gray-600">Try removing this track instead</p>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="p-6 border-t-4 border-black bg-gray-50">
				<button onclick={onCancel} class="neo-button w-full"> Cancel </button>
			</div>
		</div>
	</div>
{/if}
