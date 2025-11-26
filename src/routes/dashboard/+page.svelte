<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen p-4 sm:p-8">
	<div class="max-w-4xl mx-auto">
		<div
			class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
		>
			<h1 class="text-4xl sm:text-5xl">Dashboard</h1>
			<a href="/create" class="neo-button"> Create Playlist from Image </a>
		</div>

		<div class="neo-card mb-6">
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

		{#if data.topArtists && data.topArtists.length > 0}
			<div class="neo-card mb-6">
				<h2 class="mb-4 text-2xl sm:text-3xl">Your Top Artists</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each data.topArtists as artist}
						<a
							href={artist.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-3 p-3 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform"
						>
							{#if artist.images && artist.images.length > 0}
								<img
									src={artist.images[artist.images.length - 1].url}
									alt={artist.name}
									class="w-16 h-16 border-2 border-black flex-shrink-0"
								/>
							{/if}
							<div class="flex-grow min-w-0">
								<h3 class="text-lg font-bold truncate">{artist.name}</h3>
								{#if artist.genres && artist.genres.length > 0}
									<p class="text-sm text-gray-600 truncate">
										{artist.genres.slice(0, 2).join(', ')}
									</p>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		{#if data.topTracks && data.topTracks.length > 0}
			<div class="neo-card mb-6">
				<h2 class="mb-4 text-2xl sm:text-3xl">Your Top Tracks</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each data.topTracks as track}
						<a
							href={track.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-3 p-3 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform"
						>
							{#if track.album.images && track.album.images.length > 0}
								<img
									src={track.album.images[track.album.images.length - 1].url}
									alt={track.album.name}
									class="w-16 h-16 border-2 border-black flex-shrink-0"
								/>
							{/if}
							<div class="flex-grow min-w-0">
								<h3 class="text-lg font-bold truncate">{track.name}</h3>
								<p class="text-sm text-gray-600 truncate">
									{track.artists.map((a) => a.name).join(', ')}
								</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		{#if data.recentlyPlayed && data.recentlyPlayed.length > 0}
			<div class="neo-card">
				<h2 class="mb-4 text-2xl sm:text-3xl">Recently Played</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each data.recentlyPlayed as item}
						<a
							href={item.track.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-3 p-3 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform"
						>
							{#if item.track.album.images && item.track.album.images.length > 0}
								<img
									src={item.track.album.images[item.track.album.images.length - 1].url}
									alt={item.track.album.name}
									class="w-16 h-16 border-2 border-black flex-shrink-0"
								/>
							{/if}
							<div class="flex-grow min-w-0">
								<h3 class="text-lg font-bold truncate">{item.track.name}</h3>
								<p class="text-sm text-gray-600 truncate">
									{item.track.artists.map((a) => a.name).join(', ')}
								</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
