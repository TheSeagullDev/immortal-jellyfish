const SIGNED_URL_TTL = 60 * 60;

/**
 * @param {string | null | undefined} path
 */
export function isPublicImagePath(path) {
	return typeof path === 'string' && (path.startsWith('/') || path.startsWith('http'));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} path
 */
export async function resolveImageUrl(supabase, path) {
	if (!path) return '';
	if (isPublicImagePath(path)) return path;

	const { data, error } = await supabase.storage.from('food-images').createSignedUrl(path, SIGNED_URL_TTL);
	if (error) {
		console.error('createSignedUrl failed', error);
		return '';
	}
	return data?.signedUrl ?? '';
}

export const postsSelect = `
	id,
	caption,
	rating,
	image_path,
	foods,
	created_at,
	dining_halls!dining_hall_id ( name, slug ),
	profiles!author_id ( display_name, username ),
	likes ( user_id )
`;

/**
 * @param {string | null | undefined} iso
 */
export function formatPostTime(iso) {
	if (!iso) return '';
	return new Date(iso).toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {unknown[]} rows
 * @param {string | null} userId
 */
export async function mapPosts(supabase, rows, userId = null) {
	const list = Array.isArray(rows) ? rows : [];
	return Promise.all(
		list.map(async (row) => {
			const hall = row.dining_halls && typeof row.dining_halls === 'object' ? row.dining_halls : {};
			const profile = row.profiles && typeof row.profiles === 'object' ? row.profiles : {};
			const likes = Array.isArray(row.likes) ? row.likes : [];
			return {
				id: row.id,
				caption: row.caption ?? '',
				rating: row.rating ?? 0,
				imageUrl: await resolveImageUrl(supabase, String(row.image_path ?? '')),
				createdAt: row.created_at,
				postedAt: formatPostTime(row.created_at),
				hallName: hall.name ?? '',
				username: profile.username ?? '',
				authorName: profile.display_name ?? '',
				likeCount: likes.length,
				liked: userId ? likes.some((like) => like.user_id === userId) : false,
				foods: Array.isArray(row.foods) ? row.foods.filter((name) => typeof name === 'string') : []
			};
		})
	);
}
