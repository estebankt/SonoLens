import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.set('demo_mode', 'true', {
		httpOnly: true,
		secure: false,
		path: '/',
		sameSite: 'lax',
		maxAge: 60 * 60 * 2 // 2 hours
	});
	throw redirect(302, '/create');
};
