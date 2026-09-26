<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-dvh bg-stone-50 text-stone-900">
	<header class="border-b border-stone-200 bg-white">
		<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
			<a href="/" class="font-semibold tracking-tight">Dining Hall</a>
			<nav class="flex items-center gap-3 text-sm">
				{#if data.user}
					<span class="hidden text-stone-500 sm:inline">{data.user.email}</span>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-100"
						>
							Sign out
						</button>
					</form>
				{:else}
					<a
						href="/login"
						class="rounded-md bg-stone-900 px-3 py-1.5 text-white hover:bg-stone-800"
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
