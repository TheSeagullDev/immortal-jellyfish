/**
 * Keep post-auth redirects on this origin (relative paths only).
 * @param {string | null | undefined} raw
 * @param {string} [fallback]
 */
export function safeInternalPath(raw, fallback = '/') {
	const next = typeof raw === 'string' ? raw : '';
	return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
