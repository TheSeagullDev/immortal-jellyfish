<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ComposerFab from '$lib/ComposerFab.svelte';
	import { page } from '$app/state';

	let { data, children } = $props();

	const signedIn = $derived(Boolean(data.user || data.session));
	const showComposerFab = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/') return signedIn;
		if (path === '/profile' || path.startsWith('/u/')) return true;
		return false;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div
	class="min-h-dvh"
	style="
		background: radial-gradient(ellipse 70% 50% at 50% -10%, color-mix(in srgb, var(--primary) 10%, var(--background)) 0%, var(--background) 60%);
		color: var(--text);
	"
>
	<header class="backdrop-blur-sm" style="background: color-mix(in srgb, var(--background) 88%, transparent);">
		<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
			<a href="/" class="text-lg font-bold tracking-tight" style="color:var(--text)">
				Meal<span style="color:var(--primary)">Wise</span>
			</a>
			<nav class="flex items-center gap-3 text-sm">
				{#if data.user}
					<a
						href={data.user.user_metadata?.username
							? `/u/${data.user.user_metadata.username}`
							: '/profile'}
						class="hidden sm:inline"
						style="color:var(--text-muted)"
					>
						{data.user.user_metadata?.display_name ?? data.user.email}
						{#if data.user.user_metadata?.username}
							<span>@{data.user.user_metadata.username}</span>
						{/if}
					</a>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="rounded-md px-3 py-1.5 text-sm transition-opacity hover:opacity-75"
							style="background:var(--surface);color:var(--text)"
						>
							Sign out
						</button>
					</form>
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
	</header>

	<main>
		{@render children()}
	</main>
</div>
{#if showComposerFab}
	<ComposerFab halls={data.halls ?? []} signedIn={signedIn} />
{/if}
