<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
	{#if $page.url.pathname.startsWith('/create')}
		<div class="h-24"></div>
	{/if}
</div>
