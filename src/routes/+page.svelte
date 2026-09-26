<script>
	let { data } = $props();

	// Each row: images that scroll horizontally. Duplicated for seamless loop.
	const rows = [
		{ seeds: ['hw-a1','hw-a2','hw-a3','hw-a4','hw-a5','hw-a6'], dir: 'left',  speed: 30 },
		{ seeds: ['hw-b1','hw-b2','hw-b3','hw-b4','hw-b5','hw-b6'], dir: 'right', speed: 24 },
		{ seeds: ['hw-c1','hw-c2','hw-c3','hw-c4','hw-c5','hw-c6'], dir: 'left',  speed: 28 }
	];
</script>

<svelte:head>
	<title>MealWise</title>
</svelte:head>

{#if data.user}
	<div class="mx-auto max-w-3xl px-4 py-8">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--primary)">
			Hey{data.user.user_metadata?.display_name
				? `, ${data.user.user_metadata.display_name}`
				: ''}
		</h1>
		<p class="mt-2 text-sm" style="color:var(--accent)">
			{#if data.user.user_metadata?.username}
				<span class="font-medium" style="color:var(--text)">@{data.user.user_metadata.username}</span>
				·
			{/if}
			{data.user.email}
		</p>
	</div>
{:else}
	<!-- Hero -->
	<div class="px-6 pb-12 pt-16 text-center">
		<span
			class="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
			style="background:var(--accent)"
		>
			GT Dining · Ranked by you
		</span>

		<h1 class="mt-5 text-5xl font-extrabold tracking-tight sm:text-6xl" style="color:var(--primary)">
			Meal<span style="color:var(--accent)">Wise</span>
		</h1>

		<p class="mx-auto mt-4 max-w-md text-lg leading-relaxed" style="color:var(--text);opacity:0.65">
			The dining hall social feed built for Georgia Tech.
			Post your plate, rate your food, find what's worth the walk.
		</p>

		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<a
				href="/login"
				class="rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
				style="background:var(--accent)"
			>
				Create account
			</a>
			<a
				href="/login"
				class="rounded-md border px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-75"
				style="border-color:var(--primary);color:var(--primary)"
			>
				Sign in
			</a>
		</div>
	</div>

	<!-- Scrolling image rows -->
	<div class="flex flex-col gap-3 overflow-hidden pb-12">
		{#each rows as row}
			<div class="flex gap-3" style="animation: scroll-{row.dir} {row.speed}s linear infinite;">
				{#each [...row.seeds, ...row.seeds] as seed}
					<img
						src="https://picsum.photos/seed/{seed}/320/220"
						alt=""
						width="320"
						height="220"
						class="h-44 w-72 flex-none rounded-xl object-cover"
						loading="lazy"
					/>
				{/each}
			</div>
		{/each}
	</div>

	<p class="pb-8 text-center text-xs opacity-40" style="color:var(--text)">
		For Georgia Tech students only · @gatech.edu required
	</p>
{/if}

