<script>
	let { data } = $props();

	// margin-right is baked into each image (not gap) so both halves are
	// exactly equal width and translateX(-50%) loops without a jump.
	const rows = [
		{ seeds: ['hw-a1','hw-a2','hw-a3','hw-a4','hw-a5','hw-a6'], dir: 'left',  speed: 18 },
		{ seeds: ['hw-b1','hw-b2','hw-b3','hw-b4','hw-b5','hw-b6'], dir: 'right', speed: 14 },
		{ seeds: ['hw-c1','hw-c2','hw-c3','hw-c4','hw-c5','hw-c6'], dir: 'left',  speed: 20 }
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
	<!-- Hero — mobile-first -->
	<div class="px-5 pb-10 pt-12 text-center sm:px-8 sm:pb-14 sm:pt-16">
		<span
			class="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
			style="background:var(--accent)"
		>
			GT Dining · Ranked by you
		</span>

		<h1 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl" style="color:var(--primary)">
			Meal<span style="color:var(--accent)">Wise</span>
		</h1>

		<p class="mx-auto mt-3 max-w-sm text-base leading-relaxed sm:max-w-md sm:text-lg" style="color:var(--text);opacity:0.65">
			The dining hall social feed built for Georgia Tech.
			Post your plate, rate your food, find what's worth the walk.
		</p>

		<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
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

	<!-- Scrolling rows — each image has mr-3 so both halves are identical width -->
	<div class="flex flex-col gap-3 overflow-hidden pb-10">
		{#each rows as row}
			<div
				class="flex"
				style="animation: scroll-{row.dir} {row.speed}s linear infinite; will-change: transform;"
			>
				{#each [...row.seeds, ...row.seeds] as seed}
					<img
						src="https://picsum.photos/seed/{seed}/320/220"
						alt=""
						width="320"
						height="220"
						class="h-36 w-56 flex-none rounded-xl object-cover mr-3 sm:h-44 sm:w-72"
						loading="lazy"
					/>
				{/each}
			</div>
		{/each}
	</div>

	<p class="pb-8 text-center text-xs opacity-40" style="color:var(--text)">
		Georgia Tech students only · @gatech.edu required
	</p>
{/if}
