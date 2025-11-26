<script lang="ts">
	interface Step {
		label: string;
		status: 'completed' | 'current' | 'upcoming';
	}

	interface ProgressIndicatorProps {
		steps: Step[];
	}

	let { steps }: ProgressIndicatorProps = $props();
</script>

<div class="mb-16">
	<div class="flex items-center justify-between">
		{#each steps as step, index}
			<div class="flex-1 relative">
				<!-- Step Circle -->
				<div class="flex items-center">
					<div
						class="flex items-center justify-center w-10 h-10 border-4 border-black font-bold text-sm relative z-10 shrink-0"
						class:bg-black={step.status === 'completed'}
						class:text-white={step.status === 'completed'}
						class:bg-yellow-400={step.status === 'current'}
						class:bg-white={step.status === 'upcoming'}
						class:text-gray-400={step.status === 'upcoming'}
					>
						{#if step.status === 'completed'}
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							{index + 1}
						{/if}
					</div>

					<!-- Connecting Line (not for last step) -->
					{#if index < steps.length - 1}
						<div
							class="flex-1 h-1 border-t-4 border-black mx-2"
							class:border-dashed={step.status !== 'completed'}
						></div>
					{/if}
				</div>

				<!-- Step Label -->
				<div
					class="absolute top-10 left-5 -translate-x-1/2 mt-3 w-32 text-center pointer-events-none"
				>
					<p
						class="text-xs sm:text-sm font-bold leading-tight"
						class:text-black={step.status === 'completed' || step.status === 'current'}
						class:text-gray-400={step.status === 'upcoming'}
					>
						{step.label}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>
