const MAX_EDGE = 1600;
const MAX_BYTES = 1_200_000;
const SKIP_UNDER_BYTES = 400_000;
/** Vercel serverless request bodies cap around 4.5MB. */
const HARD_LIMIT_BYTES = 4_000_000;

/**
 * Shrink a photo in the browser so the create/avatar POST fits on Vercel.
 * Falls back to the original file if decoding fails and it is already under the hard limit.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressPhotoForUpload(file) {
	if (!(file instanceof File) || file.size === 0) return file;
	if (file.size < SKIP_UNDER_BYTES && file.type === 'image/jpeg') return file;

	let bitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	} catch {
		try {
			bitmap = await createImageBitmap(file);
		} catch {
			if (file.size > HARD_LIMIT_BYTES) {
				throw new Error('That photo is too large to upload here. Try a smaller one.');
			}
			return file;
		}
	}

	try {
		const edge = Math.max(bitmap.width, bitmap.height);
		const scale = edge > MAX_EDGE ? MAX_EDGE / edge : 1;
		const width = Math.max(1, Math.round(bitmap.width * scale));
		const height = Math.max(1, Math.round(bitmap.height * scale));
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			if (file.size > HARD_LIMIT_BYTES) {
				throw new Error('That photo is too large to upload here. Try a smaller one.');
			}
			return file;
		}
		ctx.drawImage(bitmap, 0, 0, width, height);

		let quality = 0.82;
		let blob = await canvasToJpeg(canvas, quality);
		while (blob && blob.size > MAX_BYTES && quality > 0.45) {
			quality -= 0.12;
			blob = await canvasToJpeg(canvas, quality);
		}
		if (!blob) {
			if (file.size > HARD_LIMIT_BYTES) {
				throw new Error('That photo is too large to upload here. Try a smaller one.');
			}
			return file;
		}
		if (blob.size > HARD_LIMIT_BYTES) {
			throw new Error('That photo is still too large after compressing. Try a different shot.');
		}
		const name = file.name.replace(/\.[^.]+$/, '') || 'photo';
		return new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
	} finally {
		bitmap.close?.();
	}
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} quality
 * @returns {Promise<Blob | null>}
 */
function canvasToJpeg(canvas, quality) {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
	});
}
