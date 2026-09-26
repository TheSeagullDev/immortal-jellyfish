/** Browser and Storage CDN cache lifetime for an immutable object. */
export const IMAGE_CACHE_SECONDS = 60 * 60 * 24 * 7;
export const IMAGE_CACHE_CONTROL = String(IMAGE_CACHE_SECONDS);

/** Re-sign before the shared URL dies so an open tab still loads. */
const REFRESH_BEFORE_MS = 60 * 60 * 1000;

/** @type {Map<string, { url: string, expiresAtMs: number }>} */
const memoryCache = new Map();

let loggedMissingCacheTable = false;

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
	const urls = await resolveImageUrls(supabase, [path]);
	return urls.get(path) ?? '';
}

/**
 * One signed URL per object, reused until it is close to expiry.
 * Identical URLs let Storage's CDN serve later views as cached egress.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Array<string | null | undefined>} paths
 * @returns {Promise<Map<string, string>>}
 */
export async function resolveImageUrls(supabase, paths) {
	/** @type {Map<string, string>} */
	const urls = new Map();
	/** @type {string[]} */
	const storagePaths = [];

	for (const path of paths) {
		if (!path) {
			urls.set(path ?? '', '');
			continue;
		}
		if (isPublicImagePath(path)) {
			urls.set(path, path);
			continue;
		}
		if (!storagePaths.includes(path)) storagePaths.push(path);
	}

	const now = Date.now();
	/** @type {string[]} */
	const misses = [];
	for (const path of storagePaths) {
		const hit = memoryCache.get(path);
		if (hit && hit.expiresAtMs - REFRESH_BEFORE_MS > now) {
			urls.set(path, hit.url);
		} else {
			misses.push(path);
		}
	}

	const fromDb = await readSharedUrls(supabase, misses);
	/** @type {string[]} */
	const unsigned = [];
	for (const path of misses) {
		const hit = fromDb.get(path);
		if (!hit) {
			unsigned.push(path);
			continue;
		}
		memoryCache.set(path, hit);
		urls.set(path, hit.url);
	}

	if (unsigned.length) {
		const signed = await signPaths(supabase, unsigned);
		/** @type {{ path: string, signed_url: string, expires_at: string }[]} */
		const rows = [];
		for (const path of unsigned) {
			const hit = signed.get(path);
			if (!hit) {
				urls.set(path, '');
				continue;
			}
			memoryCache.set(path, hit);
			urls.set(path, hit.url);
			rows.push({
				path,
				signed_url: hit.url,
				expires_at: new Date(hit.expiresAtMs).toISOString()
			});
		}
		await writeSharedUrls(supabase, rows);
	}

	return urls;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string[]} paths
 * @returns {Promise<Map<string, { url: string, expiresAtMs: number }>>}
 */
async function readSharedUrls(supabase, paths) {
	/** @type {Map<string, { url: string, expiresAtMs: number }>} */
	const found = new Map();
	if (!paths.length) return found;

	const freshAfter = new Date(Date.now() + REFRESH_BEFORE_MS).toISOString();
	const { data, error } = await supabase
		.from('storage_url_cache')
		.select('path, signed_url, expires_at')
		.in('path', paths)
		.gt('expires_at', freshAfter);

	if (error) {
		noteCacheTableError(error);
		return found;
	}

	for (const row of data ?? []) {
		const expiresAtMs = new Date(row.expires_at).getTime();
		if (!row.path || !row.signed_url || Number.isNaN(expiresAtMs)) continue;
		found.set(row.path, { url: row.signed_url, expiresAtMs });
	}
	return found;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ path: string, signed_url: string, expires_at: string }[]} rows
 */
async function writeSharedUrls(supabase, rows) {
	if (!rows.length) return;
	const { error } = await supabase.from('storage_url_cache').upsert(rows, { onConflict: 'path' });
	if (error) noteCacheTableError(error);
}

/**
 * @param {{ code?: string, message?: string }} error
 */
function noteCacheTableError(error) {
	const message = error.message ?? '';
	const missing =
		error.code === 'PGRST205' || error.code === '42P01' || message.includes('storage_url_cache');
	if (missing) {
		if (!loggedMissingCacheTable) {
			loggedMissingCacheTable = true;
			console.error(
				'storage_url_cache is missing; apply supabase/migrations/20260926223000_storage_egress_cache.sql so photo URLs stay shared across servers'
			);
		}
		return;
	}
	console.error('storage url cache failed', message || error);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string[]} paths
 * @returns {Promise<Map<string, { url: string, expiresAtMs: number }>>}
 */
async function signPaths(supabase, paths) {
	/** @type {Map<string, { url: string, expiresAtMs: number }>} */
	const signed = new Map();
	const expiresAtMs = Date.now() + IMAGE_CACHE_SECONDS * 1000;

	for (let i = 0; i < paths.length; i += 100) {
		const chunk = paths.slice(i, i + 100);
		const { data, error } = await supabase.storage
			.from('food-images')
			.createSignedUrls(chunk, IMAGE_CACHE_SECONDS);

		if (error || !data) {
			console.error('createSignedUrls failed', error);
			continue;
		}

		data.forEach((item, index) => {
			const path = item.path || chunk[index];
			if (!path || !item.signedUrl || item.error) {
				if (item.error) console.error('createSignedUrl failed', path, item.error);
				return;
			}
			signed.set(path, { url: item.signedUrl, expiresAtMs });
		});
	}

	return signed;
}
