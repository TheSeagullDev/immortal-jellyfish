/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals: { safeGetSession, supabase }, cookies }) => {
	const { session, user } = await safeGetSession();
	let halls = [];
	if (user) {
		const { data } = await supabase.from('dining_halls').select('id, name, slug').order('name');
		halls = data ?? [];
	}

	return {
		session,
		user,
		halls,
		cookies: cookies.getAll()
	};
};
