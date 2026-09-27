import { resolveImageUrls } from '$lib/food-images.js';

export const postsSelect = `
	id,
	author_id,
	caption,
	rating,
	image_path,
	foods,
	created_at,
	dining_halls!dining_hall_id ( name, slug ),
	profiles!author_id ( display_name, username ),
	likes ( user_id ),
	comments ( id, body, created_at, profiles!author_id ( username ) )
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
 * @param {string | null | undefined} iso
 */
export function formatRelativeTime(iso) {
	if (!iso) return '';
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return '';
	const sec = Math.round((Date.now() - then) / 1000);
	if (sec < 45) return 'just now';
	const min = Math.round(sec / 60);
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day === 1) return 'Yesterday';
	if (day < 7) return `${day}d ago`;
	return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {unknown[]} rows
 * @param {string | null} userId
 */
export async function mapPosts(supabase, rows, userId = null) {
	const list = Array.isArray(rows) ? rows : [];
	const imageUrls = await resolveImageUrls(
		supabase,
		list.map((row) => String(row.image_path ?? ''))
	);
	const mapped = list.map((row) => {
		const hall = row.dining_halls && typeof row.dining_halls === 'object' ? row.dining_halls : {};
		const profile = row.profiles && typeof row.profiles === 'object' ? row.profiles : {};
		const likes = Array.isArray(row.likes) ? row.likes : [];
		const comments = Array.isArray(row.comments) ? [...row.comments] : [];
		comments.sort((a, b) => String(a.created_at ?? '').localeCompare(String(b.created_at ?? '')));
		const imagePath = String(row.image_path ?? '');
		return {
			id: row.id,
			authorId: row.author_id ?? '',
			caption: row.caption ?? '',
			rating: row.rating ?? 0,
			imageUrl: imageUrls.get(imagePath) ?? '',
			createdAt: row.created_at,
			postedAt: formatPostTime(row.created_at),
			hallName: hall.name ?? '',
			username: profile.username ?? '',
			authorName: profile.display_name ?? '',
			avatarUrl: '',
			likeCount: likes.length,
			liked: userId ? likes.some((like) => like.user_id === userId) : false,
			foods: Array.isArray(row.foods) ? row.foods.filter((name) => typeof name === 'string') : [],
			comments: comments.map((comment) => {
				const commentProfile =
					comment.profiles && typeof comment.profiles === 'object' ? comment.profiles : {};
				return {
					id: comment.id,
					body: comment.body ?? '',
					createdAt: comment.created_at,
					username: commentProfile.username ?? ''
				};
			})
		};
	});

	const usernames = [...new Set(mapped.map((post) => post.username).filter(Boolean))];
	if (!usernames.length) return mapped;

	const { data: avatars, error } = await supabase
		.from('profiles')
		.select('username, avatar_path')
		.in('username', usernames);

	if (error || !avatars) {
		return mapped;
	}

	const avatarUrls = await resolveImageUrls(
		supabase,
		avatars.map((row) => String(row.avatar_path ?? ''))
	);
	/** @type {Record<string, string>} */
	const urls = {};
	for (const row of avatars) {
		urls[row.username] = avatarUrls.get(String(row.avatar_path ?? '')) ?? '';
	}

	return mapped.map((post) => ({
		...post,
		avatarUrl: urls[post.username] || ''
	}));
}
