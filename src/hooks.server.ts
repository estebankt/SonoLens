import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();
	const { method } = event.request;
	const { pathname } = event.url;

	try {
		const response = await resolve(event);
		const duration = Date.now() - startTime;

		// Log successful requests
		console.log(`[${method}] ${pathname} - ${response.status} (${duration}ms)`);

		return response;
	} catch (error: any) {
		const duration = Date.now() - startTime;

		// Log errors with details
		console.error(`[ERROR] [${method}] ${pathname} (${duration}ms)`, {
			message: error.message,
			stack: error.stack,
			status: error.status || 500
		});

		// Re-throw the error to let SvelteKit handle it
		throw error;
	}
};
