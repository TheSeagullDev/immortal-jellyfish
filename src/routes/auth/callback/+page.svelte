<script>
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(async () => {
		const hash = window.location.hash.replace(/^#/, '');
		const params = new URLSearchParams(hash);
		const access_token = params.get('access_token');
		const refresh_token = params.get('refresh_token');

		if (access_token && refresh_token) {
			const { error } = await data.supabase.auth.setSession({ access_token, refresh_token });
			if (error) {
				console.error('setSession from email link failed', error);
				goto('/login', { replaceState: true });
				return;
			}
		}

		const {
			data: { session }
		} = await data.supabase.auth.getSession();

		if (!session) {
			goto('/login', { replaceState: true });
			return;
		}

		await invalidate('supabase:auth');
		goto(data.next, { replaceState: true });
	});
</script>

<p class="p-8 text-center text-sm" style="color:var(--muted)">Signing you in…</p>
