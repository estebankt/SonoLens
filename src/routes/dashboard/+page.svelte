<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen p-4 sm:p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="mb-6 sm:mb-8 text-4xl sm:text-5xl">Dashboard</h1>

		<div class="neo-card">
			{#if data.user}
				<div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
					{#if data.user.images && data.user.images.length > 0}
						<img
							src={data.user.images[0].url}
							alt={data.user.display_name}
							class="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0"
							style="border: 4px solid black;"
						/>
					{/if}

					<div class="text-center sm:text-left flex-grow">
						<h2 class="mb-2 text-3xl sm:text-4xl">{data.user.display_name}</h2>
						<p class="text-lg sm:text-xl mb-4 break-all">{data.user.email}</p>

						<form method="POST" action="/auth/logout">
							<button type="submit" class="neo-button w-full sm:w-auto"> Logout </button>
						</form>
					</div>
				</div>
			{:else}
				<p class="text-center">Loading user data...</p>
			{/if}
		</div>
	</div>
</div>
