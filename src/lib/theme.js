export const THEME_KEY = 'mw-theme';
/** `'0'` = manual; missing or `'1'` = follow the system (default). */
export const THEME_SYSTEM_KEY = 'mw-theme-system';

/**
 * @returns {'manual' | 'system'}
 */
export function readThemeMode() {
	if (typeof localStorage === 'undefined') return 'system';
	return localStorage.getItem(THEME_SYSTEM_KEY) === '0' ? 'manual' : 'system';
}

/**
 * @returns {'light' | 'dark'}
 */
export function readTheme() {
	if (typeof localStorage === 'undefined') return 'light';
	return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

function systemPrefersDark() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * @returns {'light' | 'dark'}
 */
export function resolvedTheme() {
	if (readThemeMode() === 'manual') return readTheme();
	return systemPrefersDark() ? 'dark' : 'light';
}

export function syncDocumentTheme() {
	document.documentElement.classList.toggle('dark', resolvedTheme() === 'dark');
}

/**
 * @param {boolean} useSystem
 */
export function setUseSystemTheme(useSystem) {
	localStorage.setItem(THEME_SYSTEM_KEY, useSystem ? '1' : '0');
	if (!useSystem && !localStorage.getItem(THEME_KEY)) {
		localStorage.setItem(THEME_KEY, systemPrefersDark() ? 'dark' : 'light');
	}
	syncDocumentTheme();
}

/**
 * @param {'light' | 'dark'} theme
 */
export function applyTheme(theme) {
	const next = theme === 'dark' ? 'dark' : 'light';
	localStorage.setItem(THEME_KEY, next);
	localStorage.setItem(THEME_SYSTEM_KEY, '0');
	syncDocumentTheme();
}

export function watchSystemTheme() {
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const onChange = () => {
		if (readThemeMode() === 'system') syncDocumentTheme();
	};
	mq.addEventListener('change', onChange);
	return () => mq.removeEventListener('change', onChange);
}
