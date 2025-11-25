<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="mb-8">Dashboard</h1>

		<div class="neo-card">
			{#if data.user}
				<div class="flex items-center gap-6">
					{#if data.user.images && data.user.images.length > 0}
						<img src={data.user.images[0].url} alt={data.user.display_name} class="w-32 h-32" style="border: 4px solid black;" />
					{/if}

					<div>
						<h2 class="mb-2">{data.user.display_name}</h2>
						<p class="text-xl mb-4">{data.user.email}</p>

						<form method="POST" action="/auth/logout">
							<button type="submit" class="neo-button"> Logout </button>
						</form>
					</div>
				</div>
			{:else}
				<p>Loading user data...</p>
			{/if}
		</div>
	</div>
</div>
