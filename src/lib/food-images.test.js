import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resetImageUrlCache, resolveImageUrls } from './food-images.js';

function mockSupabase({ table = new Map(), tokens = [] } = {}) {
	let signCalls = 0;

	return {
		signCalls: () => signCalls,
		from() {
			const state = { paths: [] };
			const builder = {
				select() {
					return builder;
				},
				in(_col, paths) {
					state.paths = paths;
					return builder;
				},
				gt() {
					return builder;
				},
				upsert(rows) {
					for (const row of rows) table.set(row.path, row);
					return Promise.resolve({ error: null });
				},
				then(resolve, reject) {
					const data = state.paths.map((path) => table.get(path)).filter(Boolean);
					return Promise.resolve({ data, error: null }).then(resolve, reject);
				}
			};
			return builder;
		},
		storage: {
			from() {
				return {
					async createSignedUrls(paths) {
						signCalls += 1;
						return {
							data: paths.map((path) => {
								const token = `t${tokens.length}`;
								tokens.push(token);
								return { path, signedUrl: `https://example.test/${path}?token=${token}` };
							}),
							error: null
						};
					}
				};
			}
		}
	};
}

test('resolveImageUrls reuses one URL in memory so later renders do not re-sign', async () => {
	resetImageUrlCache();
	const supabase = mockSupabase();
	const first = await resolveImageUrls(supabase, ['meal.jpg']);
	const second = await resolveImageUrls(supabase, ['meal.jpg']);
	assert.equal(first.get('meal.jpg'), second.get('meal.jpg'));
	assert.equal(supabase.signCalls(), 1);
});

test('resolveImageUrls reuses a URL written by another process', async () => {
	resetImageUrlCache();
	const shared = new Map();
	const writer = mockSupabase({ table: shared });
	const reader = mockSupabase({ table: shared });

	const written = await resolveImageUrls(writer, ['avatar.jpg']);
	resetImageUrlCache();
	const read = await resolveImageUrls(reader, ['avatar.jpg']);

	assert.equal(read.get('avatar.jpg'), written.get('avatar.jpg'));
	assert.equal(reader.signCalls(), 0);
});
