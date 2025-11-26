<script lang="ts">
	import { fade } from 'svelte/transition';

	interface TooltipProps {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		children?: import('svelte').Snippet;
	}

	let { text, position = 'top', children }: TooltipProps = $props();
	let showTooltip = $state(false);

	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};

	const arrowClasses = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-black border-l-transparent border-r-transparent border-b-transparent',
		bottom:
			'bottom-full left-1/2 -translate-x-1/2 border-b-black border-l-transparent border-r-transparent border-t-transparent',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-black border-t-transparent border-b-transparent border-r-transparent',
		right:
			'right-full top-1/2 -translate-y-1/2 border-r-black border-t-transparent border-b-transparent border-l-transparent'
	};
</script>

<div
	class="relative inline-block"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	onfocus={() => (showTooltip = true)}
	onblur={() => (showTooltip = false)}
	role="tooltip"
	aria-label={text}
>
	{@render children?.()}

	{#if showTooltip}
		<div
			transition:fade={{ duration: 150 }}
			class="absolute z-50 px-3 py-2 text-sm font-bold text-white bg-black border-2 border-black whitespace-nowrap {positionClasses[
				position
			]}"
		>
			{text}
			<!-- Tooltip Arrow -->
			<div class="absolute w-0 h-0 border-4 {arrowClasses[position]}"></div>
		</div>
	{/if}
</div>
