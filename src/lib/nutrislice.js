const NUTRISLICE_BASE = 'https://techdining.api.nutrislice.com/menu/api/weeks/school';

/** App `dining_halls.slug` → Nutrislice school slug */
export const NUTRISLICE_SCHOOLS = {
	brittain: 'brittain',
	'north-ave': 'north-ave-dining-hall',
	'west-village': 'west-village'
};

export const NUTRISLICE_MEALS = ['breakfast', 'lunch', 'dinner', 'brunch'];

/**
 * @param {string | null | undefined} hallSlug
 */
export function nutrisliceSchoolSlug(hallSlug) {
	return NUTRISLICE_SCHOOLS[hallSlug ?? ''] ?? null;
}

/**
 * Flatten one day's `menu_items` into unique foods (station headers skipped).
 * @param {unknown} payload week JSON from Nutrislice
 * @param {string} isoDate YYYY-MM-DD
 * @returns {{ date: string, foods: { id: number, name: string, station: string }[] }}
 */
export function parseMenuDay(payload, isoDate) {
	const days = payload && typeof payload === 'object' ? /** @type {{ days?: unknown[] }} */ (payload).days : [];
	const day = Array.isArray(days)
		? days.find((d) => d && typeof d === 'object' && /** @type {{ date?: string }} */ (d).date === isoDate)
		: null;

	if (!day || typeof day !== 'object') {
		return { date: isoDate, foods: [] };
	}

	return { date: isoDate, foods: foodsFromItems(/** @type {{ menu_items?: unknown[] }} */ (day).menu_items) };
}

/**
 * @param {unknown} payload
 * @returns {{ startDate: string, foods: { id: number, name: string, station: string }[] }}
 */
export function parseMenuWeek(payload) {
	const root = payload && typeof payload === 'object' ? /** @type {{ start_date?: string, days?: unknown[] }} */ (payload) : {};
	const seen = new Set();
	/** @type {{ id: number, name: string, station: string }[]} */
	const foods = [];

	for (const day of Array.isArray(root.days) ? root.days : []) {
		for (const food of foodsFromItems(day && typeof day === 'object' ? day.menu_items : [])) {
			if (seen.has(food.id)) continue;
			seen.add(food.id);
			foods.push(food);
		}
	}

	return { startDate: root.start_date ?? '', foods };
}

/**
 * @param {unknown} items
 * @returns {{ id: number, name: string, station: string }[]}
 */
function foodsFromItems(items) {
	/** @type {{ id: number, name: string, station: string }[]} */
	const foods = [];
	const seen = new Set();
	let station = '';

	for (const item of Array.isArray(items) ? items : []) {
		if (!item || typeof item !== 'object') continue;

		if (item.is_station_header || item.is_section_title) {
			station = typeof item.text === 'string' ? item.text.trim() : station;
			continue;
		}

		const food = item.food;
		if (!food || typeof food !== 'object') continue;
		const name = typeof food.name === 'string' ? food.name.trim() : '';
		const id = typeof food.id === 'number' ? food.id : Number(food.id);
		if (!name || !Number.isFinite(id) || seen.has(id)) continue;
		seen.add(id);
		foods.push({ id, name, station });
	}

	return foods;
}

/**
 * Atlanta calendar date as YYYY-MM-DD.
 * @param {Date} [now]
 */
export function atlantaDate(now = new Date()) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/New_York',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

/**
 * @param {string} schoolSlug
 * @param {string} meal
 * @param {string} isoDate
 */
export function nutrisliceWeekUrl(schoolSlug, meal, isoDate) {
	const [year, month, day] = isoDate.split('-');
	return `${NUTRISLICE_BASE}/${schoolSlug}/menu-type/${meal}/${year}/${month}/${day}?format=json`;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
/** @type {Map<string, { expires: number, value: unknown }>} */
const weekCache = new Map();

/**
 * @param {string} schoolSlug
 * @param {string} meal
 * @param {string} isoDate
 */
export async function fetchMenuWeek(schoolSlug, meal, isoDate) {
	const url = nutrisliceWeekUrl(schoolSlug, meal, isoDate);
	const cached = weekCache.get(url);
	if (cached && cached.expires > Date.now()) {
		return cached.value;
	}

	const res = await fetch(url, {
		headers: { accept: 'application/json' },
		signal: AbortSignal.timeout(12_000)
	});
	if (!res.ok) {
		throw new Error(`Nutrislice ${res.status} for ${schoolSlug}/${meal}`);
	}

	const payload = await res.json();
	weekCache.set(url, { expires: Date.now() + CACHE_TTL_MS, value: payload });
	return payload;
}

/**
 * Today's Atlanta menu for a hall, union of breakfast/lunch/dinner/brunch.
 * @param {string | null | undefined} hallSlug app dining_halls.slug
 * @param {string} [isoDate]
 * @param {string[]} [meals]
 */
export async function fetchTodayFoods(hallSlug, isoDate = atlantaDate(), meals = NUTRISLICE_MEALS) {
	const schoolSlug = nutrisliceSchoolSlug(hallSlug);
	if (!schoolSlug) {
		return { date: isoDate, schoolSlug: null, foods: [], errors: [`Unknown hall slug: ${hallSlug}`] };
	}

	const mealList = meals.length ? meals : NUTRISLICE_MEALS;

	/** @type {string[]} */
	const errors = [];
	const seen = new Set();
	/** @type {{ id: number, name: string, station: string, meal: string }[]} */
	const foods = [];

	const results = await Promise.allSettled(
		mealList.map(async (meal) => {
			const week = await fetchMenuWeek(schoolSlug, meal, isoDate);
			return { meal, foods: parseMenuDay(week, isoDate).foods };
		})
	);

	for (const result of results) {
		if (result.status === 'rejected') {
			errors.push(String(result.reason?.message ?? result.reason));
			continue;
		}
		for (const food of result.value.foods) {
			if (seen.has(food.id)) continue;
			seen.add(food.id);
			foods.push({ ...food, meal: result.value.meal });
		}
	}

	return { date: isoDate, schoolSlug, foods, errors };
}

/**
 * @param {number} hour 0–23
 * @returns {string[]}
 */
export function mealsForHour(hour) {
	if (hour < 10) return ['breakfast'];
	if (hour < 16) return ['lunch', 'brunch'];
	return ['dinner'];
}

/**
 * @param {string} dateValue YYYY-MM-DD or empty
 * @param {string} timeValue HH:MM or empty
 */
export function menuWhen(dateValue, timeValue) {
	const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : atlantaDate();
	const hour = timeValue && /^\d{2}:\d{2}/.test(timeValue) ? Number(timeValue.slice(0, 2)) : null;
	const meals = hour === null || Number.isNaN(hour) ? NUTRISLICE_MEALS : mealsForHour(hour);
	return { isoDate, meals };
}
