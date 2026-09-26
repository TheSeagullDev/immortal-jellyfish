import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			/**
			 * @param {{ name: string, value: string, options?: Record<string, unknown> }[]} cookiesToSet
			 * @param {Record<string, string>} [headers]
			 */
			setAll: (cookiesToSet, headers = {}) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { path: '/', ...options });
				});
				if (Object.keys(headers).length > 0) {
					event.setHeaders(headers);
				}
			}
		}
	});

	/**
	 * Prefer getUser over getSession on the server — it revalidates with Auth.
	 * @returns {Promise<{ session: import('@supabase/supabase-js').Session | null, user: import('@supabase/supabase-js').User | null }>}
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
