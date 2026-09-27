import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { compressImage } from './compress-image.js';

test('compressImage shrinks a large photo to the max edge', async () => {
	const original = await sharp({
		create: { width: 4000, height: 3000, channels: 3, background: { r: 180, g: 40, b: 40 } }
	})
		.jpeg({ quality: 95 })
		.toBuffer();

	const out = await compressImage(new Uint8Array(original), 'image/jpeg', { maxEdge: 1600 });
	const meta = await sharp(out.bytes).metadata();

	assert.equal(out.ext, 'jpg');
	assert.ok(out.bytes.byteLength < original.byteLength);
	assert.equal(meta.width, 1600);
	assert.equal(meta.height, 1200);
});
