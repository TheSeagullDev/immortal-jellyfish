<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div
	class="min-h-dvh"
	style="
		background: radial-gradient(ellipse 80% 60% at 15% 0%, color-mix(in srgb, var(--accent) 18%, var(--background)) 0%, var(--background) 55%),
		            radial-gradient(ellipse 60% 50% at 90% 100%, color-mix(in srgb, var(--primary) 14%, var(--background)) 0%, transparent 70%);
		color: var(--text);
	"
>
	<header
		class="border-b backdrop-blur-sm"
		style="border-color: color-mix(in srgb, var(--secondary) 60%, transparent); background: color-mix(in srgb, var(--background) 80%, transparent);"
	>
		<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
			<a href="/" class="text-lg font-bold tracking-tight" style="color:var(--primary)">
				MealWise
			</a>
			<nav class="flex items-center gap-3 text-sm">
				{#if data.user}
					<a href="/profile" class="hidden sm:inline" style="color:var(--accent)">
						{data.user.user_metadata?.display_name ?? data.user.email}
						{#if data.user.user_metadata?.username}
							<span style="opacity:0.6;color:var(--text)">@{data.user.user_metadata.username}</span>
						{/if}
					</a>
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

	<main>
		{@render children()}
	</main>
</div>
