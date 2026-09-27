const POST_SKIP_UNDER_BYTES = 400_000;

/**
 * Resize and re-encode a photo before it is stored.
 * Falls back to the original bytes if decoding fails so posting still works.
 *
 * @param {Uint8Array} bytes
 * @param {string} mimeType
 * @param {{ maxEdge: number, quality?: number }} options
 * @returns {Promise<{ bytes: Uint8Array, contentType: string, ext: string }>}
 */
export async function compressImage(bytes, mimeType, { maxEdge, quality = 80 }) {
	const fallback = {
		bytes,
		contentType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
		ext: extensionForMime(mimeType)
	};

	try {
		const sharp = (await import('sharp')).default;
		const input = sharp(bytes, { failOn: 'none', animated: false }).rotate();
		const meta = await input.metadata();
		const edge = Math.max(meta.width ?? 0, meta.height ?? 0);
		const alreadySmall =
			meta.format === 'jpeg' &&
			edge > 0 &&
			edge <= maxEdge &&
			bytes.byteLength < (maxEdge >= 1000 ? POST_SKIP_UNDER_BYTES : 120_000);
		if (alreadySmall) {
			return { bytes, contentType: 'image/jpeg', ext: 'jpg' };
		}

		const out = await input
			.resize({
				width: maxEdge,
				height: maxEdge,
				fit: 'inside',
				withoutEnlargement: true
			})
			.jpeg({ quality, mozjpeg: true })
			.toBuffer();

		return { bytes: new Uint8Array(out), contentType: 'image/jpeg', ext: 'jpg' };
	} catch (err) {
		console.error('image compress failed, storing original', err);
		return fallback;
	}
}

/**
 * @param {string} mimeType
 */
function extensionForMime(mimeType) {
	if (mimeType.includes('png')) return 'png';
	if (mimeType.includes('webp')) return 'webp';
	if (mimeType.includes('gif')) return 'gif';
	if (mimeType.includes('heic') || mimeType.includes('heif')) return 'heic';
	return 'jpg';
}
