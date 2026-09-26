import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ locals }) => {
		const { error } = await locals.supabase.auth.signOut();
		if (error) {
			console.error('signOut failed', error);
		}
		throw redirect(303, '/login');
	}
};
