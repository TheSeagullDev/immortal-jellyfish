import { fail, redirect } from '@sveltejs/kit';
import {
	emailUnverifiedMessage,
	gatechEmailErrorMessage,
	isEmailVerified,
	isGatechEmail,
	normalizeEmail
} from '$lib/auth/email.js';

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
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = normalizeEmail(String(form.get('email') ?? ''));
		const password = String(form.get('password') ?? '');

		if (!isGatechEmail(email)) {
			return fail(400, { email, error: gatechEmailErrorMessage() });
		}

		if (!password) {
			return fail(400, { email, error: 'Password is required.' });
		}

		const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			console.error('sign in failed', error.message, error.cause ?? '');
			const unreachable = error.message === 'fetch failed';
			const unconfirmed = /not confirmed|confirm/i.test(error.message);
			return fail(400, {
				email,
				error: unreachable
					? 'Could not reach Supabase Auth. Check PUBLIC_SUPABASE_URL and that the app can access the internet.'
					: unconfirmed
						? emailUnverifiedMessage()
						: error.message
			});
		}

		if (!isEmailVerified(data.user)) {
			await locals.supabase.auth.signOut();
			return fail(400, { email, error: emailUnverifiedMessage() });
		}

		throw redirect(303, '/');
	}
};
