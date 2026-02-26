<script lang="ts">
	import { page } from '$app/stores';

	const error = $page.url.searchParams.get('error');

	const errorMessages: Record<string, string> = {
		access_denied: 'You denied access to Spotify. Please try again.',
		no_code: 'Authorization failed. No code received from Spotify.',
		no_verifier: 'Session expired. Please try logging in again.',
		token_exchange_failed: 'Failed to exchange authorization code. Please try again.',
		profile_fetch_failed: 'Could not fetch your profile. Please try again.',
		session_expired: 'Your session has expired. Please log in again.'
	};

	const errorMessage = error ? errorMessages[error] || 'An unknown error occurred.' : null;
</script>

<div class="min-h-screen flex items-center justify-center p-4 sm:p-8">
	<div class="text-center max-w-2xl w-full px-4">
		<h1 class="mb-4 sm:mb-6 text-4xl sm:text-5xl">SonoLens</h1>
		<p class="text-xl sm:text-2xl mb-6 sm:mb-8 font-semibold px-2">
			Transform images into Spotify playlists
		</p>

		{#if errorMessage}
			<div class="neo-card mb-6 sm:mb-8 bg-red-50 border-red-600">
				<p class="font-bold text-red-600 text-base sm:text-lg">{errorMessage}</p>
			</div>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
			<a href="/auth/login" class="neo-button w-full sm:w-auto"> Login with Spotify </a>
			<a href="/demo" class="neo-button-secondary w-full sm:w-auto">Try Demo (No account needed)</a>
		</div>
	</div>
</div>
