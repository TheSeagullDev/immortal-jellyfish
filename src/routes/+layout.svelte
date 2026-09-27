<script>
	import './layout.css';
	import logo from '$lib/assets/logo.png';
	import AccountMenu from '$lib/AccountMenu.svelte';
	import ComposerFab from '$lib/ComposerFab.svelte';
	import { syncDocumentTheme, watchSystemTheme } from '$lib/theme.js';
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();

	onMount(() => {
		syncDocumentTheme();
		const unwatchTheme = watchSystemTheme();
		let cancelled = false;

		(async () => {
			if (page.url.pathname === '/auth/callback') return;
			const hash = window.location.hash.replace(/^#/, '');
			if (!hash.includes('access_token')) return;
			const params = new URLSearchParams(hash);
			const access_token = params.get('access_token');
			const refresh_token = params.get('refresh_token');
			if (!access_token || !refresh_token) return;
			const { error } = await data.supabase.auth.setSession({ access_token, refresh_token });
			if (error || cancelled) return;
			history.replaceState(null, '', window.location.pathname + window.location.search);
			await invalidate('supabase:auth');
		})();

		return () => {
			cancelled = true;
			unwatchTheme();
		};
	});

	const signedIn = $derived(Boolean(data.user || data.session));
	const showComposerFab = $derived.by(() => {
		if (!signedIn) return false;
		const path = page.url.pathname;
		return path === '/' || path === '/profile' || path.startsWith('/u/');
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={logo} />
</svelte:head>

<div
	class="min-h-dvh"
	style="
		background: radial-gradient(ellipse 70% 50% at 50% -10%, color-mix(in srgb, var(--primary) 10%, var(--background)) 0%, var(--background) 60%);
		color: var(--text);
	"
>
	<header
		class="backdrop-blur-sm"
		style="background: color-mix(in srgb, var(--background) 88%, transparent);"
	>
		<div class="app-col">
			<div class="flex items-center justify-between gap-4 py-4">
				<div class="flex items-center gap-8">
					<a href="/" class="flex items-center gap-2 text-xl font-bold tracking-tight" style="color:var(--text)">
						<img src={logo} alt="" width="32" height="30" class="h-8 w-8 object-contain" />
						<span>Meal<span style="color:var(--primary)">Wise</span></span>
					</a>
				</div>
				<nav class="flex items-center gap-3 text-sm">
					{#if data.user}
						<AccountMenu user={data.user} />
					{:else}
						<a
							href="/login"
							class="rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
							style="background:var(--primary);color:var(--on-primary)"
						>
							Sign in
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<main class={data.user ? 'app-col py-6' : undefined}>
		{@render children()}
	</main>
</div>
{#if showComposerFab}
	<ComposerFab halls={data.halls ?? []} {signedIn} />
{/if}
