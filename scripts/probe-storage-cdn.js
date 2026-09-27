#!/usr/bin/env node
/**
 * Live check that the egress bandaids actually work against the linked project.
 *
 * 1. Two createSignedUrl calls for the same object return different tokens
 *    (this is why an uncached feed re-downloads the file every page view).
 * 2. resolveImageUrls returns the same URL twice (memory + storage_url_cache).
 * 3. Fetching that shared URL twice: first origin, second should be a CDN HIT
 *    if Cache-Control is long enough.
 *
 * Uses a 1x1 JPEG so this probe itself barely moves the meter.
 * Requires the Supabase CLI to be logged in (same as `supabase db push`).
 *
 *   node scripts/probe-storage-cdn.js
 */
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import {
	resolveImageUrls,
	resetImageUrlCache,
	IMAGE_CACHE_CONTROL
} from '../src/lib/food-images.js';

const PROJECT_REF = 'fxhbqgatypiaoqgdaloh';
const BUCKET = 'food-images';
const PATH = `_egress-probe/${Date.now()}.jpg`;

const PIXEL = await sharp({
	create: { width: 1, height: 1, channels: 3, background: { r: 0, g: 0, b: 0 } }
})
	.jpeg({ quality: 40 })
	.toBuffer();

function envValue(name) {
	try {
		for (const line of readFileSync(resolveEnv(), 'utf8').split('\n')) {
			const trimmed = line.trim();
			if (!trimmed.startsWith(`${name}=`)) continue;
			return trimmed.slice(name.length + 1).replace(/^["']|["']$/g, '');
		}
	} catch {
		// no local env file
	}
	return process.env[name] ?? '';
}

function resolveEnv() {
	return new URL('../.env.local', import.meta.url).pathname;
}

function loadServiceKey() {
	const raw = execSync(
		`npx supabase projects api-keys --project-ref ${PROJECT_REF} --reveal -o json`,
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
	);
	const start = raw.indexOf('[');
	const parsed = JSON.parse(start >= 0 ? raw.slice(start) : raw);
	const secret =
		parsed.find((row) => row.name === 'service_role' || row.id === 'service_role') ??
		parsed.find((row) => String(row.name ?? '').includes('service'));
	const key = secret?.api_key || secret?.key || secret?.secret;
	if (!key) throw new Error('Could not read service_role key from supabase CLI.');
	return key;
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

function urlFingerprint(url) {
	try {
		const token = new URL(url).searchParams.get('token') ?? '';
		return { length: token.length, tail: token.slice(-8) };
	} catch {
		return { length: 0, tail: '' };
	}
}

/**
 * @param {string} url
 * @param {number} n
 */
async function fetchOnce(url, n) {
	const res = await fetch(url, { cache: 'no-store' });
	const bytes = Buffer.from(await res.arrayBuffer()).byteLength;
	const interesting = {};
	for (const name of res.headers.keys()) {
		if (/cache|age|cf-|x-sb|content-type|content-length/i.test(name)) {
			interesting[name] = res.headers.get(name);
		}
	}
	const headers = {
		status: res.status,
		bytes,
		cfCache: res.headers.get('cf-cache-status') || res.headers.get('x-cache') || '(none)',
		age: res.headers.get('age'),
		...interesting
	};
	console.log(`GET ${n}`, headers);
	return headers;
}

const url = envValue('PUBLIC_SUPABASE_URL');
if (!url) {
	console.error('PUBLIC_SUPABASE_URL missing from .env.local');
	process.exit(1);
}

const supabase = createClient(url, loadServiceKey(), {
	auth: { persistSession: false, autoRefreshToken: false }
});

const { error: uploadError } = await supabase.storage.from(BUCKET).upload(PATH, PIXEL, {
	contentType: 'image/jpeg',
	cacheControl: IMAGE_CACHE_CONTROL,
	upsert: false
});
if (uploadError) {
	console.error('upload failed', uploadError.message);
	process.exit(1);
}

try {
	const a = await supabase.storage.from(BUCKET).createSignedUrl(PATH, 3600);
	await sleep(2000);
	const b = await supabase.storage.from(BUCKET).createSignedUrl(PATH, 3600);
	const unique = a.data?.signedUrl !== b.data?.signedUrl;
	console.log('createSignedUrl 2s apart tokens differ', unique, {
		a: urlFingerprint(a.data?.signedUrl ?? ''),
		b: urlFingerprint(b.data?.signedUrl ?? '')
	});

	resetImageUrlCache();
	const first = (await resolveImageUrls(supabase, [PATH])).get(PATH) ?? '';
	const second = (await resolveImageUrls(supabase, [PATH])).get(PATH) ?? '';
	const reused = first === second && Boolean(first);
	console.log('resolveImageUrls reused URL', reused);

	resetImageUrlCache();
	const afterRestart = (await resolveImageUrls(supabase, [PATH])).get(PATH) ?? '';
	const shared = afterRestart === first && Boolean(afterRestart);
	console.log('storage_url_cache reused URL after memory clear', shared);

	if (!first) {
		console.error('FAIL: no signed URL');
		process.exit(1);
	}

	if (unique && a.data?.signedUrl && b.data?.signedUrl) {
		console.log('GET two different signed URLs (old feed behavior):');
		await fetchOnce(a.data.signedUrl, 'A');
		await fetchOnce(b.data.signedUrl, 'B');
	}

	console.log('GET the same shared URL twice (new feed behavior):');
	const miss = await fetchOnce(first, 1);
	await sleep(1500);
	const hit = await fetchOnce(first, 2);

	const cached =
		hit.cfCache === 'HIT' ||
		(hit.age != null && Number(hit.age) > 0) ||
		(miss.cfCache === 'MISS' && hit.cfCache === 'HIT');
	console.log('second GET of shared URL looks cached', cached);

	if (reused && shared && miss.status === 200 && hit.status === 200 && cached) {
		console.log('OK: sharing the URL makes GET 2 a CDN HIT (cached egress).');
	} else {
		console.error('CHECK: review the lines above; URL reuse + CDN HIT is the required pass.');
		process.exitCode = 1;
	}
} finally {
	await supabase.storage.from(BUCKET).remove([PATH]);
	await supabase.from('storage_url_cache').delete().eq('path', PATH);
}
