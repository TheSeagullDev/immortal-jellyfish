import { fail, redirect } from '@sveltejs/kit';
import {
	emailUnverifiedMessage,
	gatechEmailErrorMessage,
	isEmailVerified,
	isGatechEmail,
	normalizeEmail
} from '$lib/auth/email.js';

/** @type {import('@supabase/supabase-js').EmailOtpType[]} */
const RESET_OTP_TYPES = ['email', 'magiclink'];

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} email
 * @param {string} token
 */
async function verifyResetOtp(supabase, email, token) {
	let lastError = /** @type {import('@supabase/supabase-js').AuthError | null} */ (null);
	for (const type of RESET_OTP_TYPES) {
		const { error } = await supabase.auth.verifyOtp({ email, token, type });
		if (!error) return null;
		lastError = error;
	}
	return lastError;
}

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

	reset: async ({ request, locals }) => {
		const form = await request.formData();
		const email = normalizeEmail(String(form.get('email') ?? ''));

		if (!isGatechEmail(email)) {
			return fail(400, { resetEmail: email, error: gatechEmailErrorMessage() });
		}

		const { error } = await locals.supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false
			}
		});

		if (error && !/signups not allowed for otp|user not found/i.test(error.message)) {
			console.error('reset otp failed', error.message);
		}

		return { otpSent: true, resetEmail: email };
	},

	verifyOtp: async ({ request, locals }) => {
		const form = await request.formData();
		const email = normalizeEmail(String(form.get('email') ?? ''));
		const token = String(form.get('token') ?? '').replace(/\s/g, '');

		if (!isGatechEmail(email)) {
			return fail(400, { resetEmail: email, otpSent: true, error: gatechEmailErrorMessage() });
		}

		if (!token) {
			return fail(400, {
				resetEmail: email,
				otpSent: true,
				error: 'Enter the 6-digit code from your email.'
			});
		}

		const error = await verifyResetOtp(locals.supabase, email, token);
		if (error) {
			console.error('verify reset otp failed', error.message);
			return fail(400, {
				resetEmail: email,
				otpSent: true,
				error: 'That code is invalid or expired.'
			});
		}

		const { user } = await locals.safeGetSession();
		if (!user) {
			await locals.supabase.auth.signOut();
			return fail(400, {
				resetEmail: email,
				otpSent: true,
				error: emailUnverifiedMessage()
			});
		}

		throw redirect(303, '/settings?setPassword=1');
	}
};
