<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-dvh" style="background:var(--background);color:var(--text)">
	<header class="border-b" style="border-color:var(--secondary);background:var(--background)">
		<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
			<a href="/" class="text-lg font-bold tracking-tight" style="color:var(--primary)">
				MealWise
			</a>
			<nav class="flex items-center gap-3 text-sm">
				{#if data.user}
					<span class="hidden sm:inline" style="color:var(--accent)">
						{data.user.user_metadata?.display_name ?? data.user.email}
						{#if data.user.user_metadata?.username}
							<span style="color:var(--secondary)">@{data.user.user_metadata.username}</span>
						{/if}
					</span>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="rounded-md border px-3 py-1.5 text-sm transition-opacity hover:opacity-75"
							style="border-color:var(--secondary);color:var(--text)"
						>
							Sign out
						</button>
					</form>
				{:else}
					<a
						href="/login"
						class="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
						style="background:var(--primary)"
					>
						Sign in
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-4 py-8">
		{@render children()}
	</main>
</div>
