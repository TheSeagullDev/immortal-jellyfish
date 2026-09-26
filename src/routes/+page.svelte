<script>
	let { data } = $props();

	const features = [
		{ emoji: '📸', title: 'Snap your tray', desc: 'Upload a photo of what you got' },
		{ emoji: '⭐', title: 'Rate & review', desc: 'Let the people know what slaps' },
		{ emoji: '🔥', title: 'See what\'s trending', desc: 'Find the best plates on campus' }
	];
</script>

<svelte:head>
	<title>MealWise</title>
</svelte:head>

{#if data.user}
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
{:else}
	<!-- Hero -->
	<div class="py-14 text-center">
		<span
			class="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
			style="background:var(--accent)"
		>
			GT Dining · Ranked by you
		</span>

		<h1 class="mt-4 text-5xl font-extrabold tracking-tight" style="color:var(--primary)">
			Meal<span style="color:var(--accent)">Wise</span>
		</h1>

		<p class="mx-auto mt-4 max-w-md text-lg leading-relaxed" style="color:var(--text);opacity:0.7">
			The dining hall social feed built for Georgia Tech.
			<br />Post your plate, rate your food, find what's worth the walk.
		</p>

		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<a
				href="/login?mode=signup"
				class="rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
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

	<!-- Feature cards -->
	<div class="mt-4 grid gap-4 sm:grid-cols-3">
		{#each features as f}
			<div
				class="rounded-xl p-5 text-center"
				style="background:var(--secondary);color:var(--text)"
			>
				<div class="mb-2 text-3xl">{f.emoji}</div>
				<div class="font-semibold">{f.title}</div>
				<div class="mt-1 text-sm opacity-70">{f.desc}</div>
			</div>
		{/each}
	</div>

	<!-- Social proof nudge -->
	<p class="mt-10 text-center text-sm opacity-50" style="color:var(--text)">
		For Georgia Tech students only · @gatech.edu required
	</p>
{/if}
