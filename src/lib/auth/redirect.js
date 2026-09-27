/**
 * Keep post-auth redirects on this origin (relative paths only).
 * @param {string | null | undefined} raw
 * @param {string} [fallback]
 */
export function safeInternalPath(raw, fallback = '/') {
	const next = typeof raw === 'string' ? raw : '';
	return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

/**
 * PKCE email redirects often land on Site URL (`/`) with `?code=` instead of `/auth/callback`.
 * @param {URL} url
 * @returns {string | null}
 */
export function authCallbackRedirectPath(url) {
	if (url.pathname === '/auth/callback') return null;

	const params = url.searchParams;
	if (params.has('token_hash') && params.has('type')) {
		return `/auth/callback${url.search}`;
	}

	const fromHome =
		url.pathname === '/' && (params.has('code') || params.has('access_token') || params.has('error'));
	if (fromHome) {
		return `/auth/callback${url.search}`;
	}

	return null;
}
