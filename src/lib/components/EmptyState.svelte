<script lang="ts">
	interface EmptyStateProps {
		title: string;
		description?: string;
		icon?: 'music' | 'image' | 'error' | 'empty';
		actionLabel?: string;
		onAction?: () => void;
	}

	let { title, description, icon = 'empty', actionLabel, onAction }: EmptyStateProps = $props();
</script>

<div class="neo-card text-center p-12">
	<!-- Icon -->
	<div class="mb-4 flex justify-center">
		{#if icon === 'music'}
			<svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
				/>
			</svg>
		{:else if icon === 'image'}
			<svg
				class="w-20 h-20 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
			>
				<circle cx="12" cy="12" r="9" />
				<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
			</svg>
		{:else if icon === 'error'}
			<svg class="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
					clip-rule="evenodd"
				/>
			</svg>
		{:else}
			<svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
				/>
			</svg>
		{/if}
	</div>

	<!-- Title -->
	<h3 class="text-2xl font-bold mb-2">{title}</h3>

	<!-- Description -->
	{#if description}
		<p class="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
	{/if}

	<!-- Action Button -->
	{#if actionLabel && onAction}
		<button onclick={onAction} class="neo-button">
			{actionLabel}
		</button>
	{/if}
</div>
