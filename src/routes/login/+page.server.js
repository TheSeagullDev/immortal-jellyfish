import { fail, redirect } from '@sveltejs/kit';
import { gatechEmailErrorMessage, isGatechEmail, normalizeEmail } from '$lib/auth/email.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (user) {
		throw redirect(303, '/');
	}

	return {
		registered: url.searchParams.get('registered') === '1'
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, locals }) => {
		const form = await request.formData();
		const email = normalizeEmail(String(form.get('email') ?? ''));
		const password = String(form.get('password') ?? '');

		if (!isGatechEmail(email)) {
			return fail(400, { email, error: gatechEmailErrorMessage(), mode: 'login' });
		}

		if (!password) {
			return fail(400, { email, error: 'Password is required.', mode: 'login' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, {
				email,
				error: error.message,
				mode: 'login'
			});
		}

		throw redirect(303, '/');
	},

	signup: async ({ request, locals, url }) => {
		const form = await request.formData();
		const email = normalizeEmail(String(form.get('email') ?? ''));
		const password = String(form.get('password') ?? '');

		if (!isGatechEmail(email)) {
			return fail(400, { email, error: gatechEmailErrorMessage(), mode: 'signup' });
		}

		if (password.length < 6) {
			return fail(400, {
				email,
				error: 'Password must be at least 6 characters.',
				mode: 'signup'
			});
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			return fail(400, {
				email,
				error: error.message,
				mode: 'signup'
			});
		}

		// If email confirmation is on, there may be no session yet.
		if (!data.session) {
			throw redirect(303, '/login?registered=1');
		}

		throw redirect(303, '/');
	}
};
