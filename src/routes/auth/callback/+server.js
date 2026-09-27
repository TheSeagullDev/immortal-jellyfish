import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const nextRaw = url.searchParams.get('next') ?? '/';
	const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('exchangeCodeForSession failed', error);
			throw redirect(303, '/login');
		}
	}

	throw redirect(303, next);
};
