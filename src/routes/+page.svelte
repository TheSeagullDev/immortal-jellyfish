<script>
	let { data } = $props();

	// Card dimensions — must match the inline styles below so CSS calc is exact.
	const CARD_W = 192;
	const CARD_GAP = 12;
	const PER_CARD = CARD_W + CARD_GAP;
	const SET_SIZE = 6;
	const SET_W = SET_SIZE * PER_CARD; // 1224px

	const rows = [
		{
			dir: 'left',
			speed: 18,
			posts: [
				{ seed: 'mw-f1', name: 'Chicken Tikka Masala', hall: 'North Ave', rating: 4.5, user: 'gburdell3' },
				{ seed: 'mw-f2', name: 'Beef Street Tacos',   hall: 'Brittain',   rating: 4.2, user: 'ramblinwreck' },
				{ seed: 'mw-f3', name: 'Margherita Pizza',    hall: 'West Village', rating: 3.8, user: 'stinggt' },
				{ seed: 'mw-f4', name: 'Poke Bowl',           hall: 'North Ave',   rating: 4.7, user: 'techie42' },
				{ seed: 'mw-f5', name: 'Mac & Cheese',        hall: 'Brittain',   rating: 4.0, user: 'buzzy99' },
				{ seed: 'mw-f6', name: 'Pad Thai',            hall: 'West Village', rating: 4.3, user: 'csgt01' },
			]
		},
		{
			dir: 'right',
			speed: 14,
			posts: [
				{ seed: 'mw-f7',  name: 'Grilled Salmon',    hall: 'North Ave',    rating: 4.8, user: 'gabby22' },
				{ seed: 'mw-f8',  name: 'BBQ Short Ribs',    hall: 'West Village', rating: 4.6, user: 'yellojkt' },
				{ seed: 'mw-f9',  name: 'Veggie Stir Fry',   hall: 'Brittain',     rating: 3.5, user: 'engineerx' },
				{ seed: 'mw-f10', name: 'Sushi Roll Set',    hall: 'Brittain',     rating: 4.9, user: 'rambler5' },
				{ seed: 'mw-f11', name: 'Caesar Salad',      hall: 'North Ave',    rating: 3.2, user: 'csgt01' },
				{ seed: 'mw-f12', name: 'Pasta Primavera',   hall: 'West Village', rating: 3.9, user: 'jdoe9' },
			]
		},
	];

	/** @param {number} r */
	function stars(r) {
		const full = Math.floor(r);
		const half = r - full >= 0.5;
		return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
	}
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
	<div class="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-16">
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

	<!-- Scrolling post-card rows -->
	<div class="flex flex-col gap-3 overflow-hidden pb-10">
		{#each rows as row}
			<!--
				--set-w must equal SET_SIZE × (CARD_W + CARD_GAP) exactly.
				Keyframes use calc(-1 * var(--set-w)) so the pixel translation
				is always precise regardless of container size.
			-->
			<div
				class="flex"
				style="--set-w:{SET_W}px; animation: scroll-{row.dir} {row.speed}s linear infinite; will-change: transform;"
			>
				{#each [...row.posts, ...row.posts] as post}
					<div
						class="flex-none overflow-hidden rounded-xl border"
						style="width:{CARD_W}px; margin-right:{CARD_GAP}px; background:var(--background); border-color:color-mix(in srgb, var(--secondary) 70%, transparent);"
					>
						<img
							src="https://picsum.photos/seed/{post.seed}/{CARD_W}/140"
							alt=""
							width={CARD_W}
							height="140"
							class="block w-full object-cover"
							style="height:140px"
							loading="eager"
						/>
						<div class="p-2.5">
							<p class="truncate text-sm font-semibold leading-tight" style="color:var(--text)">{post.name}</p>
							<p class="mt-0.5 truncate text-xs opacity-55" style="color:var(--text)">{post.hall} · @{post.user}</p>
							<p class="mt-1 text-xs font-medium" style="color:var(--accent)">{post.rating} / 5</p>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<p class="pb-8 text-center text-xs opacity-40" style="color:var(--text)">
		Georgia Tech students only · @gatech.edu required
	</p>
{/if}
