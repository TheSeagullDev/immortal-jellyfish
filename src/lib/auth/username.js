const USERNAME_PATTERN = /^[a-z0-9]([a-z0-9._]{1,22}[a-z0-9])?$/;

/**
 * @param {string | null | undefined} username
 */
export function normalizeUsername(username) {
	return typeof username === 'string' ? username.trim().toLowerCase() : '';
}

/**
 * @param {string | null | undefined} username
 */
export function isValidUsername(username) {
	const normalized = normalizeUsername(username);
	return USERNAME_PATTERN.test(normalized);
}

export function usernameErrorMessage() {
	return 'Username must be 3–24 characters: letters, numbers, dots, or underscores.';
}
