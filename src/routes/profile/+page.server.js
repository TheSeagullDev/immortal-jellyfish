import { redirect } from '@sveltejs/kit';
import { mapPosts, postsSelect } from '$lib/posts.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		throw redirect(303, '/login');
	}

	const [{ data: profile, error: profileError }, { data: postRows, error: postsError }] =
		await Promise.all([
			locals.supabase
				.from('profiles')
				.select('display_name, username, created_at')
				.eq('id', user.id)
				.maybeSingle(),
			locals.supabase
				.from('posts')
				.select(postsSelect)
				.eq('author_id', user.id)
				.order('created_at', { ascending: false })
		]);

	if (profileError) {
		console.error('profile load failed', profileError);
	}
	if (postsError) {
		console.error('profile posts load failed', postsError);
	}

	const displayName =
		profile?.display_name ?? user.user_metadata?.display_name ?? user.email ?? 'You';
	const username = profile?.username ?? user.user_metadata?.username ?? '';

	return {
		profile: {
			displayName,
			username,
			joinedAt: profile?.created_at ?? null
		},
		posts: await mapPosts(locals.supabase, postRows ?? [], user.id),
		postsError: postsError?.message ?? null
	};
};
