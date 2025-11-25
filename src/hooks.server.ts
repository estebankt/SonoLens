import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();
	const { method, url } = event.request;

	try {
		const response = await resolve(event);
		const duration = Date.now() - startTime;

		// Log successful requests
		console.log(`[${method}] ${url.pathname} - ${response.status} (${duration}ms)`);

		return response;
	} catch (error: any) {
		const duration = Date.now() - startTime;

		// Log errors with details
		console.error(`[ERROR] [${method}] ${url.pathname} (${duration}ms)`, {
			message: error.message,
			stack: error.stack,
			status: error.status || 500
		});

		// Re-throw the error to let SvelteKit handle it
		throw error;
	}
};
