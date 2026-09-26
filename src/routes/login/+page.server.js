import { fail, redirect } from '@sveltejs/kit';
import { gatechEmailErrorMessage, isGatechEmail, normalizeEmail } from '$lib/auth/email.js';
import {
	isValidUsername,
	normalizeUsername,
	usernameErrorMessage
} from '$lib/auth/username.js';

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
		const name = String(form.get('name') ?? '').trim();
		const username = normalizeUsername(String(form.get('username') ?? ''));
		const email = normalizeEmail(String(form.get('email') ?? ''));
		const password = String(form.get('password') ?? '');

		if (!name) {
			return fail(400, {
				name,
				username,
				email,
				error: 'Name is required.',
				mode: 'signup'
			});
		}

		if (!isValidUsername(username)) {
			return fail(400, {
				name,
				username,
				email,
				error: usernameErrorMessage(),
				mode: 'signup'
			});
		}

		if (!isGatechEmail(email)) {
			return fail(400, {
				name,
				username,
				email,
				error: gatechEmailErrorMessage(),
				mode: 'signup'
			});
		}

		if (password.length < 6) {
			return fail(400, {
				name,
				username,
				email,
				error: 'Password must be at least 6 characters.',
				mode: 'signup'
			});
		}

		const { data: existingProfile, error: usernameLookupError } = await locals.supabase
			.from('profiles')
			.select('username')
			.eq('username', username)
			.maybeSingle();

		if (usernameLookupError) {
			return fail(400, {
				name,
				username,
				email,
				error: usernameLookupError.message,
				mode: 'signup'
			});
		}

		if (existingProfile) {
			return fail(400, {
				name,
				username,
				email,
				error: 'That username is already taken.',
				mode: 'signup'
			});
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`,
				data: {
					display_name: name,
					username
				}
			}
		});

		if (error) {
			const message =
				error.message.toLowerCase().includes('duplicate') ||
				error.message.toLowerCase().includes('unique')
					? 'That username is already taken.'
					: error.message;

			return fail(400, {
				name,
				username,
				email,
				error: message,
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
