import { readable } from 'svelte/store';

export const page = readable({
	url: {
		searchParams: new URLSearchParams()
	}
});
