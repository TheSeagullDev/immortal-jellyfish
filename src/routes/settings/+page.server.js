import { fail, redirect } from '@sveltejs/kit';
import { isValidUsername, normalizeUsername, usernameErrorMessage } from '$lib/auth/username.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		throw redirect(303, '/login');
	}

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('display_name, username')
		.eq('id', user.id)
		.maybeSingle();

	return {
		email: user.email ?? '',
		displayName: profile?.display_name ?? user.user_metadata?.display_name ?? '',
		username: profile?.username ?? user.user_metadata?.username ?? ''
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	updateName: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) {
			throw redirect(303, '/login');
		}

		const form = await request.formData();
		const displayName = String(form.get('display_name') ?? '').trim();

		if (!displayName) {
			return fail(400, { field: 'name', displayName, error: 'Name is required.' });
		}

		const { error: updateError } = await locals.supabase
			.from('profiles')
			.update({ display_name: displayName })
			.eq('id', user.id);

		if (updateError) {
			return fail(400, { field: 'name', displayName, error: updateError.message });
		}

		const { error: metaError } = await locals.supabase.auth.updateUser({
			data: {
				display_name: displayName,
				username: user.user_metadata?.username
			}
		});

		if (metaError) {
			return fail(400, { field: 'name', displayName, error: metaError.message });
		}

		return { updated: 'name' };
	},

	updateUsername: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) {
			throw redirect(303, '/login');
		}

		const form = await request.formData();
		const username = normalizeUsername(String(form.get('username') ?? ''));

		if (!isValidUsername(username)) {
			return fail(400, { field: 'username', username, error: usernameErrorMessage() });
		}

		const { data: taken } = await locals.supabase
			.from('profiles')
			.select('id')
			.eq('username', username)
			.neq('id', user.id)
			.maybeSingle();

		if (taken) {
			return fail(400, { field: 'username', username, error: 'That username is taken.' });
		}

		const { error: updateError } = await locals.supabase
			.from('profiles')
			.update({ username })
			.eq('id', user.id);

		if (updateError) {
			return fail(400, { field: 'username', username, error: updateError.message });
		}

		const { error: metaError } = await locals.supabase.auth.updateUser({
			data: {
				display_name: user.user_metadata?.display_name,
				username
			}
		});

		if (metaError) {
			return fail(400, { field: 'username', username, error: metaError.message });
		}

		return { updated: 'username' };
	},

	changePassword: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user?.email) {
			throw redirect(303, '/login');
		}

		const form = await request.formData();
		const oldPassword = String(form.get('old_password') ?? '');
		const newPassword = String(form.get('new_password') ?? '');
		const confirm = String(form.get('new_password_confirm') ?? '');

		if (!oldPassword) {
			return fail(400, { field: 'password', error: 'Old password is required.' });
		}
		if (newPassword.length < 6) {
			return fail(400, { field: 'password', error: 'New password must be at least 6 characters.' });
		}
		if (newPassword !== confirm) {
			return fail(400, { field: 'password', error: 'New passwords do not match.' });
		}
		if (newPassword === oldPassword) {
			return fail(400, {
				field: 'password',
				error: 'New password must be different from the old password.'
			});
		}

		const { error: verifyError } = await locals.supabase.auth.signInWithPassword({
			email: user.email,
			password: oldPassword
		});

		if (verifyError) {
			return fail(400, { field: 'password', error: 'Old password is incorrect.' });
		}

		const { error } = await locals.supabase.auth.updateUser({ password: newPassword });
		if (error) {
			return fail(400, { field: 'password', error: error.message });
		}

		return { updated: 'password' };
	}
};
