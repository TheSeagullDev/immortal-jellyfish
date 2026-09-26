<script>
	let { data, form } = $props();

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

	// Repeat each set enough times that the strip always covers wide viewports.
	const COPIES = 4;

	/**
	 * @param {typeof rows[0]['posts']} posts
	 */
	function looped(posts) {
		return Array.from({ length: COPIES }, () => posts).flat();
	}
</script>

<svelte:head>
	<title>MealWise</title>
</svelte:head>

{#if data.user}
	<div class="mx-auto max-w-3xl px-4 py-6">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--primary)">Feed</h1>

		<form
			method="POST"
			action="?/create"
			enctype="multipart/form-data"
			class="mt-4 space-y-3 rounded-xl border p-4"
			style="border-color:var(--secondary);background:color-mix(in srgb,var(--background) 80%,transparent)"
		>
			<p class="text-sm font-semibold">New post</p>

			{#if form?.error}
				<p class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
					{form.error}
				</p>
			{/if}

			<label class="block text-sm">
				<span class="mb-1 block font-medium">Photo</span>
				<input type="file" name="image" accept="image/*" capture="environment" required class="block w-full text-sm" />
			</label>

			<label class="block text-sm">
				<span class="mb-1 block font-medium">Caption</span>
				<input
					type="text"
					name="caption"
					value={form?.caption ?? ''}
					required
					maxlength="200"
					placeholder="What's on the tray?"
					class="block w-full rounded-md text-sm"
					style="border-color:var(--secondary)"
				/>
			</label>

			<div class="grid grid-cols-2 gap-3">
				<label class="block text-sm">
					<span class="mb-1 block font-medium">Hall</span>
					<select
						name="dining_hall_id"
						required
						class="block w-full rounded-md text-sm"
						style="border-color:var(--secondary)"
					>
						<option value="">Select</option>
						{#each data.halls ?? [] as hall}
							<option value={hall.id} selected={form?.hallId === hall.id}>{hall.name}</option>
						{/each}
					</select>
				</label>

				<fieldset class="text-sm">
					<legend class="mb-1 font-medium">Rating</legend>
					<div class="flex flex-wrap gap-2">
						{#each [1, 2, 3, 4, 5] as n}
							<label class="flex items-center gap-1">
								<input type="radio" name="rating" value={n} required checked={Number(form?.rating) === n} />
								{n}
							</label>
						{/each}
					</div>
				</fieldset>
			</div>

			<button
				type="submit"
				class="w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white"
				style="background:var(--accent)"
			>
				Post
			</button>
		</form>

		{#if data.feedError}
			<p class="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
				{data.feedError}
			</p>
		{:else if !data.posts?.length}
			<p class="mt-8 text-center text-sm opacity-50">No posts yet. Be the first.</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each data.posts as post}
					<article
						class="overflow-hidden rounded-xl border"
						style="background:var(--background);border-color:color-mix(in srgb,var(--secondary) 70%,transparent)"
					>
						{#if post.imageUrl}
							<div class="photo-frame">
								<img src={post.imageUrl} alt="" />
							</div>
						{/if}
						<div class="space-y-1 p-3">
							<p class="font-semibold leading-tight">{post.caption}</p>
							<p class="text-sm opacity-60">
								{post.hallName} · @{post.username} · {post.postedAt}
							</p>
							<div class="flex items-center justify-between pt-1">
								<p class="text-sm font-medium" style="color:var(--accent)">{post.rating} / 5</p>
								<form method="POST" action="?/{post.liked ? 'unlike' : 'like'}">
									<input type="hidden" name="post_id" value={post.id} />
									<button
										type="submit"
										class="rounded-md border px-2.5 py-1 text-xs font-medium"
										style="border-color:var(--secondary);{post.liked ? 'background:var(--primary);color:#fff' : ''}"
									>
										{post.liked ? 'Liked' : 'Like'} · {post.likeCount}
									</button>
								</form>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
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
				{#each looped(row.posts) as post}
					<div
						class="flex-none overflow-hidden rounded-xl border"
						style="width:{CARD_W}px; margin-right:{CARD_GAP}px; background:var(--background); border-color:color-mix(in srgb, var(--secondary) 70%, transparent);"
					>
						<div class="photo-frame">
							<img
								src="https://picsum.photos/seed/{post.seed}/192/256"
								alt=""
								width="192"
								height="256"
								loading="eager"
							/>
						</div>
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
		By Georgia Tech Students, For Georgia Tech Students
	</p>
{/if}
