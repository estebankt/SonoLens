<script lang="ts">
	import type { MoodAnalysis } from '$lib/types/phase2';

	interface Props {
		analysis: MoodAnalysis;
		onGeneratePlaylist?: () => void;
		isGenerating?: boolean;
	}

	let { analysis, onGeneratePlaylist, isGenerating = false }: Props = $props();
</script>

<div class="neo-card">
	<h2 class="text-3xl font-bold mb-6">{analysis.suggested_playlist_title}</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
		<!-- Mood Tags -->
		<div>
			<h3 class="text-xl font-bold mb-3">Mood</h3>
			<div class="flex flex-wrap gap-2">
				{#each analysis.mood_tags as tag}
					<span class="px-3 py-1 bg-yellow-200 border-2 border-black text-sm font-bold">
						{tag}
					</span>
				{/each}
			</div>
		</div>

		<!-- Energy Level -->
		<div>
			<h3 class="text-xl font-bold mb-3">Energy</h3>
			<div class="flex items-center gap-2">
				<span
					class="px-4 py-2 border-2 border-black font-bold uppercase"
					class:bg-blue-200={analysis.energy_level === 'low'}
					class:bg-green-200={analysis.energy_level === 'medium'}
					class:bg-red-200={analysis.energy_level === 'high'}
				>
					{analysis.energy_level}
				</span>
			</div>
		</div>

		<!-- Color Palette -->
		{#if analysis.color_palette && analysis.color_palette.length > 0}
			<div>
				<h3 class="text-xl font-bold mb-3">Colors</h3>
				<div class="flex flex-wrap gap-2">
					{#each analysis.color_palette as color}
						<span class="px-3 py-1 bg-white border-2 border-black text-sm">
							{color}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Recommended Genres -->
		<div>
			<h3 class="text-xl font-bold mb-3">Genres</h3>
			<div class="flex flex-wrap gap-2">
				{#each analysis.recommended_genres as genre}
					<span class="px-3 py-1 bg-purple-200 border-2 border-black text-sm">
						{genre}
					</span>
				{/each}
			</div>
		</div>
	</div>

	<!-- Atmosphere Description -->
	{#if analysis.atmosphere}
		<div class="mb-6 p-4 bg-gray-50 border-4 border-black">
			<h3 class="text-xl font-bold mb-2">Atmosphere</h3>
			<p class="text-lg">{analysis.atmosphere}</p>
		</div>
	{/if}

	<!-- Emotional Descriptors -->
	{#if analysis.emotional_descriptors && analysis.emotional_descriptors.length > 0}
		<div class="mb-6">
			<h3 class="text-xl font-bold mb-3">Emotional Qualities</h3>
			<div class="flex flex-wrap gap-2">
				{#each analysis.emotional_descriptors as descriptor}
					<span class="px-3 py-1 bg-pink-200 border-2 border-black text-sm">
						{descriptor}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Generate Playlist Button -->
	{#if onGeneratePlaylist}
		<div class="text-center">
			<button
				onclick={onGeneratePlaylist}
				disabled={isGenerating}
				class="neo-button text-xl px-8 py-4"
				class:opacity-50={isGenerating}
				class:cursor-not-allowed={isGenerating}
			>
				{isGenerating ? 'Generating Playlist...' : 'Generate Playlist'}
			</button>
		</div>
	{/if}
</div>
