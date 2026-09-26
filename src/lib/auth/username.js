// 3–20 chars, no spaces or characters that break URLs (@, /, ?, #, etc.)
const USERNAME_PATTERN = /^[^\s@/?#&=%+]{3,20}$/;

/**
 * @param {string | null | undefined} username
 */
export function normalizeUsername(username) {
	return typeof username === 'string' ? username.trim() : '';
}

/**
 * @param {string | null | undefined} username
 */
export function isValidUsername(username) {
	return USERNAME_PATTERN.test(normalizeUsername(username));
}

export function usernameErrorMessage() {
	return 'Username must be 3–20 characters with no spaces.';
}
