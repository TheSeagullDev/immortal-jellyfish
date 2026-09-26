import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		throw redirect(303, '/login');
	}

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('username')
		.eq('id', user.id)
		.maybeSingle();

	const username = profile?.username ?? user.user_metadata?.username;
	if (username) {
		throw redirect(303, `/u/${username}`);
	}

	throw redirect(303, '/');
};
