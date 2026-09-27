import { fail, redirect } from '@sveltejs/kit';
import {
	emailUnverifiedMessage,
	gatechEmailErrorMessage,
	isEmailVerified,
	isGatechEmail,
	normalizeEmail
} from '$lib/auth/email.js';
import { createImplicitAuthClient } from '$lib/auth/implicit-client.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (user) {
		throw redirect(303, '/');
	}

	return {
		registered: url.searchParams.get('registered') === '1',
		magicSent: url.searchParams.get('magic') === '1'
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, locals }) => {
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
	},

	magic: async ({ request, locals, url }) => {
		const form = await request.formData();
		const email = normalizeEmail(String(form.get('email') ?? ''));

		if (!isGatechEmail(email)) {
			return fail(400, { resetEmail: email, error: gatechEmailErrorMessage() });
		}

		const callback = `${url.origin}/auth/callback`;
		const { error } = await createImplicitAuthClient().auth.signInWithOtp({
			email,
			options: {
				// Do not create accounts here — signup owns profile + username.
				shouldCreateUser: false,
				emailRedirectTo: `${callback}?next=${encodeURIComponent('/settings?setPassword=1')}`
			}
		});

		if (error) {
			// Unconfirmed signups are not eligible for magic link. Resend confirm instead
			// ("Signups not allowed for otp" is GoTrue when the user is missing or unconfirmed).
			const { error: resendError } = await locals.supabase.auth.resend({
				type: 'signup',
				email,
				options: { emailRedirectTo: callback }
			});
			const expected =
				/signups not allowed for otp|user not found|already confirmed|email not confirmed/i;
			if (resendError && !expected.test(`${error.message} ${resendError.message}`)) {
				console.error('magic link failed', error.message, resendError.message);
			}
		}

		throw redirect(303, '/login?magic=1');
	}
};
