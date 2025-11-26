<script lang="ts">
	interface LoadingSpinnerProps {
		size?: 'sm' | 'md' | 'lg';
		message?: string;
		centered?: boolean;
	}

	let { size = 'md', message, centered = false }: LoadingSpinnerProps = $props();

	const sizeClasses = {
		sm: 'h-4 w-4 border-2',
		md: 'h-6 w-6 border-4',
		lg: 'h-12 w-12 border-4'
	};

	const containerClasses = centered ? 'flex items-center justify-center' : 'flex items-center gap-3';
</script>

<div class={containerClasses}>
	<div
		class="animate-spin border-black border-t-transparent rounded-full {sizeClasses[size]}"
		role="status"
		aria-label={message || 'Loading'}
	></div>
	{#if message}
		<span class="text-lg font-bold">{message}</span>
	{/if}
</div>
