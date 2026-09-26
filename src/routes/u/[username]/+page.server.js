import { error, fail, redirect } from '@sveltejs/kit';
import { containsEmailAddress, displayNameEmailErrorMessage } from '$lib/auth/email.js';
import {
	isValidUsername,
	normalizeUsername,
	usernameErrorMessage
} from '$lib/auth/username.js';
import { mapPosts, postsSelect, resolveImageUrl } from '$lib/posts.js';

/**
 * @param {{ supabase: import('@supabase/supabase-js').SupabaseClient, safeGetSession: Function }} locals
 * @param {string} username
 */
async function loadProfile(locals, username) {
	const full = await locals.supabase
		.from('profiles')
		.select(
			'id, display_name, username, created_at, avatar_path, favorite_hall_id, dining_halls!favorite_hall_id ( id, name )'
		)
		.eq('username', username)
		.maybeSingle();

	if (!full.error) {
		return full.data;
	}

	console.error('profile lookup (full) failed', full.error);

	const basic = await locals.supabase
		.from('profiles')
		.select('id, display_name, username, created_at')
		.eq('username', username)
		.maybeSingle();

	if (basic.error) {
		console.error('profile lookup failed', basic.error);
		return null;
	}

	if (!basic.data) return null;

	return {
		...basic.data,
		avatar_path: null,
		favorite_hall_id: null,
		dining_halls: null
	};
}

/**
 * @param {{ supabase: import('@supabase/supabase-js').SupabaseClient, safeGetSession: Function }} locals
 */
async function requireOwner(locals) {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return { user: null, failResult: fail(401, { error: 'Sign in to edit your profile.' }) };
	}
	return { user, failResult: null };
}

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals, params, url }) => {
	const username = normalizeUsername(params.username);
	const { user } = await locals.safeGetSession();

	const profile = await loadProfile(locals, username);
	if (!profile) {
		throw error(404, 'Profile not found');
	}

	const tab = url.searchParams.get('tab') === 'liked' ? 'liked' : 'posts';
	const isOwn = Boolean(user && user.id === profile.id);

	const [{ data: postRows, error: postsError }, { data: likeRows, error: likesError }, { data: halls }] =
		await Promise.all([
			locals.supabase
				.from('posts')
				.select(postsSelect)
				.eq('author_id', profile.id)
				.order('created_at', { ascending: false }),
			locals.supabase
				.from('likes')
				.select('post_id, created_at')
				.eq('user_id', profile.id)
				.order('created_at', { ascending: false }),
			locals.supabase.from('dining_halls').select('id, name, slug').order('name')
		]);

	if (postsError) console.error('profile posts load failed', postsError);
	if (likesError) console.error('profile likes load failed', likesError);

	const likedIds = (likeRows ?? []).map((row) => row.post_id).filter(Boolean);
	let likedPostRows = [];
	if (likedIds.length) {
		const { data: likedRows, error: likedPostsError } = await locals.supabase
			.from('posts')
			.select(postsSelect)
			.in('id', likedIds);
		if (likedPostsError) console.error('liked posts load failed', likedPostsError);
		const byId = new Map((likedRows ?? []).map((row) => [row.id, row]));
		likedPostRows = likedIds.map((id) => byId.get(id)).filter(Boolean);
	}

	const favoriteHall =
		profile.dining_halls && typeof profile.dining_halls === 'object'
			? profile.dining_halls
			: null;

	return {
		isOwn,
		tab,
		halls: halls ?? [],
		profile: {
			id: profile.id,
			displayName: profile.display_name,
			username: profile.username,
			joinedAt: profile.created_at,
			favoriteHallId: profile.favorite_hall_id ?? '',
			favoriteHallName: favoriteHall?.name ?? '',
			avatarUrl: profile.avatar_path
				? await resolveImageUrl(locals.supabase, profile.avatar_path)
				: ''
		},
		posts: await mapPosts(locals.supabase, postRows ?? [], user?.id ?? null),
		likedPosts: await mapPosts(locals.supabase, likedPostRows, user?.id ?? null),
		postsError: postsError?.message ?? likesError?.message ?? null
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	avatar: async ({ request, locals, params }) => {
		const { user, failResult } = await requireOwner(locals);
		if (!user) return failResult;

		const profile = await loadProfile(locals, normalizeUsername(params.username));
		if (!profile || profile.id !== user.id) {
			return fail(403, { error: 'You can only edit your own profile.' });
		}

		const form = await request.formData();
		const image = form.get('avatar');
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { error: 'Choose a photo.' });
		}

		const ext = image.name.includes('.') ? image.name.split('.').pop()?.toLowerCase() : 'jpg';
		const avatarPath = `${user.id}/avatar.${ext || 'jpg'}`;

		const { error: uploadError } = await locals.supabase.storage
			.from('food-images')
			.upload(avatarPath, image, {
				contentType: image.type || 'image/jpeg',
				upsert: true
			});

		if (uploadError) {
			return fail(400, { error: uploadError.message });
		}

		const { error: updateError } = await locals.supabase
			.from('profiles')
			.update({ avatar_path: avatarPath })
			.eq('id', user.id);

		if (updateError) {
			return fail(400, { error: updateError.message });
		}

		return { updated: true };
	},

	identity: async ({ request, locals, params }) => {
		const { user, failResult } = await requireOwner(locals);
		if (!user) return failResult;

		const profile = await loadProfile(locals, normalizeUsername(params.username));
		if (!profile || profile.id !== user.id) {
			return fail(403, { error: 'You can only edit your own profile.' });
		}

		const form = await request.formData();
		const displayName = String(form.get('display_name') ?? '').trim();
		const username = normalizeUsername(String(form.get('username') ?? ''));

		if (!displayName) {
			return fail(400, { error: 'Name is required.', displayName, username });
		}
		if (containsEmailAddress(displayName)) {
			return fail(400, {
				error: displayNameEmailErrorMessage(),
				displayName,
				username
			});
		}
		if (!isValidUsername(username)) {
			return fail(400, { error: usernameErrorMessage(), displayName, username });
		}

		const { data: taken } = await locals.supabase
			.from('profiles')
			.select('id')
			.eq('username', username)
			.neq('id', user.id)
			.maybeSingle();

		if (taken) {
			return fail(400, { error: 'That username is taken.', displayName, username });
		}

		const { error: updateError } = await locals.supabase
			.from('profiles')
			.update({ display_name: displayName, username })
			.eq('id', user.id);

		if (updateError) {
			return fail(400, { error: updateError.message, displayName, username });
		}

		await locals.supabase.auth.updateUser({
			data: { display_name: displayName, username }
		});

		if (username !== profile.username) {
			throw redirect(303, `/u/${username}`);
		}

		return { updated: true };
	},

	favoriteHall: async ({ request, locals, params }) => {
		const { user, failResult } = await requireOwner(locals);
		if (!user) return failResult;

		const profile = await loadProfile(locals, normalizeUsername(params.username));
		if (!profile || profile.id !== user.id) {
			return fail(403, { error: 'You can only edit your own profile.' });
		}

		const form = await request.formData();
		const hallId = String(form.get('hall_id') ?? '');
		const next = hallId && hallId !== profile.favorite_hall_id ? hallId : null;

		const { error: updateError } = await locals.supabase
			.from('profiles')
			.update({ favorite_hall_id: next })
			.eq('id', user.id);

		if (updateError) {
			return fail(400, { error: updateError.message });
		}

		return { updated: true };
	}
};
