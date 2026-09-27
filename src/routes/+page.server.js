import { fail } from '@sveltejs/kit';
import { classifyPlate } from '$lib/classify-food.js';
import { compressImage } from '$lib/compress-image.js';
import { IMAGE_CACHE_CONTROL } from '$lib/food-images.js';
import { fetchTodayFoods, menuWhen } from '$lib/nutrislice.js';
import { mapPosts, postsSelect } from '$lib/posts.js';
import { handleReportAction } from '$lib/report.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return { posts: [], halls: [] };
	}

	const [{ data: halls, error: hallsError }, { data: postRows, error: postsError }] =
		await Promise.all([
			locals.supabase.from('dining_halls').select('id, name, slug').order('name'),
			locals.supabase.from('posts').select(postsSelect).order('created_at', { ascending: false })
		]);

	if (hallsError || postsError) {
		const message = hallsError?.message ?? postsError?.message;
		console.error('feed load failed', hallsError || postsError);
		return { posts: [], halls: halls ?? [], feedError: message };
	}

	return {
		posts: await mapPosts(locals.supabase, postRows ?? [], user.id),
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
		const menuDate = String(form.get('menu_date') ?? '').trim();
		const menuTime = String(form.get('menu_time') ?? '').trim();
		const image = form.get('image');

		if (!caption) {
			return fail(400, {
				caption,
				hallId,
				rating,
				menuDate,
				menuTime,
				error: 'Caption is required.'
			});
		}
		if (!hallId) {
			return fail(400, {
				caption,
				hallId,
				rating,
				menuDate,
				menuTime,
				error: 'Pick a dining hall.'
			});
		}
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return fail(400, {
				caption,
				hallId,
				rating,
				menuDate,
				menuTime,
				error: 'Rating must be 1–5.'
			});
		}
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { caption, hallId, rating, menuDate, menuTime, error: 'Add a photo.' });
		}

		const { data: hall } = await locals.supabase
			.from('dining_halls')
			.select('slug')
			.eq('id', hallId)
			.maybeSingle();

		const { isoDate, meals } = menuWhen(menuDate, menuTime);
		const menu = await fetchTodayFoods(hall?.slug, isoDate, meals);
		console.log('[classify] menu', {
			hall: hall?.slug,
			date: menu.date,
			meals,
			itemCount: menu.foods.length,
			errors: menu.errors
		});
		const originalBytes = new Uint8Array(await image.arrayBuffer());
		const prepared = await compressImage(originalBytes, image.type || 'image/jpeg', {
			maxEdge: 1600
		});
		let foods = [];

		try {
			const classified = await classifyPlate({
				bytes: prepared.bytes,
				mimeType: prepared.contentType,
				menu: menu.foods
			});

			if (!classified.skipped && !classified.isFood) {
				console.log('[classify] rejected', classified.rejectReason);
				return fail(400, {
					caption,
					hallId,
					rating,
					menuDate,
					menuTime,
					error: "That doesn't look like a dining-hall meal. Post a photo of your plate.",
					reportKind: 'classification'
				});
			}

			foods = classified.matches.map((match) => match.name);
		} catch (err) {
			console.error('plate classify failed', err);
			// Don't block posting if Gemini / Nutrislice is down.
		}

		const postId = crypto.randomUUID();
		const imagePath = `${user.id}/${postId}.${prepared.ext}`;

		const { error: uploadError } = await locals.supabase.storage
			.from('food-images')
			.upload(imagePath, prepared.bytes, {
				contentType: prepared.contentType,
				cacheControl: IMAGE_CACHE_CONTROL,
				upsert: false
			});

		if (uploadError) {
			return fail(400, { caption, hallId, rating, menuDate, menuTime, error: uploadError.message });
		}

		const { error: insertError } = await locals.supabase.from('posts').insert({
			id: postId,
			author_id: user.id,
			dining_hall_id: hallId,
			image_path: imagePath,
			caption,
			rating,
			foods
		});

		if (insertError) {
			await locals.supabase.storage.from('food-images').remove([imagePath]);
			return fail(400, { caption, hallId, rating, menuDate, menuTime, error: insertError.message });
		}

		return { posted: true };
	},

	report: handleReportAction,

	like: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) {
			return fail(401, { error: 'Sign in to like.' });
		}

		const form = await request.formData();
		const postId = String(form.get('post_id') ?? '');
		if (!postId) {
			return fail(400, { error: 'Missing post.' });
		}

		const { error } = await locals.supabase.from('likes').insert({
			post_id: postId,
			user_id: user.id
		});

		if (error && error.code !== '23505') {
			return fail(400, { error: error.message });
		}
	},

	unlike: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) {
			return fail(401, { error: 'Sign in to unlike.' });
		}

		const form = await request.formData();
		const postId = String(form.get('post_id') ?? '');
		if (!postId) {
			return fail(400, { error: 'Missing post.' });
		}

		const { error } = await locals.supabase
			.from('likes')
			.delete()
			.eq('post_id', postId)
			.eq('user_id', user.id);

		if (error) {
			return fail(400, { error: error.message });
		}
	}
};
