import { redirect } from '@sveltejs/kit';
import { safeInternalPath } from '$lib/auth/redirect.js';

/** @type {import('@supabase/supabase-js').EmailOtpType[]} */
const OTP_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];

/**
 * @param {string | null} type
 * @returns {import('@supabase/supabase-js').EmailOtpType | null}
 */
function otpType(type) {
	if (!type) return null;
	return OTP_TYPES.includes(/** @type {import('@supabase/supabase-js').EmailOtpType} */ (type))
		? /** @type {import('@supabase/supabase-js').EmailOtpType} */ (type)
		: null;
}

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url, locals }) => {
	const next = safeInternalPath(url.searchParams.get('next'));
	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const type = otpType(url.searchParams.get('type'));
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		console.error('auth callback error', errorParam, url.searchParams.get('error_description'));
		throw redirect(303, '/login');
	}

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('exchangeCodeForSession failed', error);
			throw redirect(303, '/login');
		}
		throw redirect(303, next);
	}

	if (tokenHash && type) {
		const { error } = await locals.supabase.auth.verifyOtp({ type, token_hash: tokenHash });
		if (error) {
			console.error('verifyOtp failed', error);
			throw redirect(303, '/login');
		}
		throw redirect(303, next);
	}

	// Implicit email links put tokens in the URL hash. The server never sees them —
	// the page client calls setSession. Do not 303 here or the hash is dropped.
	return { next };
};
