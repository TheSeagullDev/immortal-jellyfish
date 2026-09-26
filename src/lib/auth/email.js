const ALLOWED_DOMAIN = 'gatech.edu';

/**
 * @param {string | null | undefined} email
 */
export function normalizeEmail(email) {
	return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

/**
 * @param {string | null | undefined} email
 */
export function isGatechEmail(email) {
	const normalized = normalizeEmail(email);
	if (!normalized || !normalized.includes('@')) return false;
	const domain = normalized.split('@').pop();
	return domain === ALLOWED_DOMAIN;
}

export function gatechEmailErrorMessage() {
	return 'Use your @gatech.edu email address.';
}

/**
 * True if the string contains an email-like ending, e.g. @gmail.com or @gatech.edu.
 * @param {string | null | undefined} value
 */
export function containsEmailAddress(value) {
	return /@[^\s@]+\.[^\s@]+/.test(String(value ?? ''));
}
