import { fail } from '@sveltejs/kit';
import { mapPosts, postsSelect } from '$lib/posts.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return { posts: [], halls: [] };
	}

	const [{ data: halls, error: hallsError }, { data: postRows, error: postsError }] = await Promise.all([
		locals.supabase.from('dining_halls').select('id, name, slug').order('name'),
		locals.supabase.from('posts').select(postsSelect).order('created_at', { ascending: false })
	]);

	if (hallsError || postsError) {
		const message = hallsError?.message ?? postsError?.message;
		console.error('feed load failed', hallsError || postsError);
		return { posts: [], halls: halls ?? [], feedError: message };
	}

	return {
		posts: await mapPosts(locals.supabase, postRows ?? []),
		halls: halls ?? []
	};
};

/** @type {import('./$types').Actions} */
export const actions = {
	create: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) {
			return fail(401, { error: 'Sign in to post.' });
		}

		const form = await request.formData();
		const caption = String(form.get('caption') ?? '').trim();
		const hallId = String(form.get('dining_hall_id') ?? '');
		const rating = Number(form.get('rating'));
		const image = form.get('image');

		if (!caption) {
			return fail(400, { caption, hallId, rating, error: 'Caption is required.' });
		}
		if (!hallId) {
			return fail(400, { caption, hallId, rating, error: 'Pick a dining hall.' });
		}
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, { caption, hallId, rating, error: 'Rating must be 1–5.' });
		}
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { caption, hallId, rating, error: 'Add a photo.' });
		}

		const postId = crypto.randomUUID();
		const ext = image.name.includes('.') ? image.name.split('.').pop()?.toLowerCase() : 'jpg';
		const imagePath = `${user.id}/${postId}.${ext || 'jpg'}`;

		const { error: uploadError } = await locals.supabase.storage
			.from('food-images')
			.upload(imagePath, image, {
				contentType: image.type || 'image/jpeg',
				upsert: false
			});

		if (uploadError) {
			return fail(400, { caption, hallId, rating, error: uploadError.message });
		}

		const { error: insertError } = await locals.supabase.from('posts').insert({
			id: postId,
			author_id: user.id,
			dining_hall_id: hallId,
			image_path: imagePath,
			caption,
			rating
		});

		if (insertError) {
			await locals.supabase.storage.from('food-images').remove([imagePath]);
			return fail(400, { caption, hallId, rating, error: insertError.message });
		}

		return { posted: true };
	}
};
