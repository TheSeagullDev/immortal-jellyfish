<script>
	import PostCard from '$lib/PostCard.svelte';
	import StarRating from '$lib/StarRating.svelte';

	let { data, form } = $props();

	let feedPosts = $state(/** @type {any[]} */ ([]));
	let composerOpen = $state(false);
	let photoName = $state('');
	let photoPreview = $state('');

	$effect(() => {
		feedPosts = (data.posts ?? []).map((post) => ({ ...post }));
	});

	$effect(() => {
		if (form?.error) composerOpen = true;
	});

	function resetPhoto() {
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoName = '';
		photoPreview = '';
	}

	function openComposer() {
		composerOpen = true;
	}

	function closeComposer() {
		composerOpen = false;
		resetPhoto();
	}

	/**
	 * @param {Event} event
	 */
	function onPhotoChange(event) {
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		const file = input.files?.[0];
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoName = file?.name ?? '';
		photoPreview = file ? URL.createObjectURL(file) : '';
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function onComposerKeydown(event) {
		if (event.key === 'Escape') closeComposer();
	}

	/**
	 * @param {any} post
	 */
	function likeEnhance(post) {
		return () => {
			const prevLiked = post.liked;
			const prevCount = post.likeCount;
			post.liked = !post.liked;
			post.likeCount += post.liked ? 1 : -1;

			return async ({ result }) => {
				if (result.type === 'failure' || result.type === 'error') {
					post.liked = prevLiked;
					post.likeCount = prevCount;
				}
			};
		};
	}

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

<svelte:window onkeydown={onComposerKeydown} />

{#if data.user}
	<div class="mx-auto max-w-3xl px-4 py-6 pb-24">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--text)">Feed</h1>

		{#if data.feedError}
			<p class="mt-4 rounded-md px-3 py-2 text-sm" style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16">
				{data.feedError}
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each feedPosts as post (post.id)}
					<PostCard {post} {likeEnhance} />
				{/each}
			</div>
		{/if}
	</div>

	{#if !composerOpen}
		<button
			type="button"
			onclick={openComposer}
			class="fixed right-5 bottom-5 z-40 grid h-14 w-14 place-items-center rounded-full p-0 transition-opacity hover:opacity-90"
			style="background:var(--primary);color:var(--on-primary)"
			aria-label="New post"
		>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M12 5v14M5 12h14"
					stroke="currentColor"
					stroke-width="2.25"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	{/if}

	{#if composerOpen}
		<div class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<button
				type="button"
				class="absolute inset-0"
				style="background:color-mix(in srgb, var(--text) 40%, transparent)"
				aria-label="Close new post"
				onclick={closeComposer}
			></button>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="new-post-title"
				class="relative z-10 w-full max-w-md rounded-xl p-4"
				style="background:var(--background)"
			>
				<div class="mb-3 flex items-center justify-between">
					<p id="new-post-title" class="text-sm font-semibold">New post</p>
					<button
						type="button"
						class="rounded-md px-2 py-1 text-sm"
						style="background:var(--surface);color:var(--text-muted)"
						onclick={closeComposer}
					>
						Close
					</button>
				</div>

				<form method="POST" action="?/create" enctype="multipart/form-data" class="space-y-3">
					{#if form?.error}
						<p class="rounded-md px-3 py-2 text-sm" style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16" role="alert">
							{form.error}
						</p>
					{/if}

					<div class="block text-sm">
						<span class="mb-1 block font-medium">Photo</span>
						<input
							id="new-post-photo"
							type="file"
							name="image"
							accept="image/*"
							capture="environment"
							required
							class="sr-only"
							onchange={onPhotoChange}
						/>
						<label
							for="new-post-photo"
							class="flex cursor-pointer items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
							style="background:var(--surface);color:var(--primary)"
						>
							{photoName ? 'Change photo' : 'Choose photo'}
						</label>
						{#if photoPreview}
							<img
								src={photoPreview}
								alt=""
								class="mt-2 max-h-40 w-full rounded-md object-contain"
								style="background:var(--surface)"
							/>
						{/if}
						{#if photoName}
							<p class="mt-1.5 truncate text-xs" style="color:var(--text-muted)">{photoName}</p>
						{:else}
							<p class="mt-1.5 text-xs" style="color:var(--text-muted)">JPG or PNG from your camera roll</p>
						{/if}
					</div>

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
						/>
					</label>

					<div class="space-y-3">
						<label class="block text-sm">
							<span class="mb-1 block font-medium">Hall</span>
							<select name="dining_hall_id" required class="block w-full rounded-md text-sm">
								<option value="">Select</option>
								{#each data.halls ?? [] as hall}
									<option value={hall.id} selected={form?.hallId === hall.id}>{hall.name}</option>
								{/each}
							</select>
						</label>

						<fieldset class="text-sm">
							<legend class="mb-1 font-medium">Rating</legend>
							<StarRating interactive name="rating" value={form?.rating ?? 0} />
						</fieldset>
					</div>

					<button
						type="submit"
						class="w-full rounded-md px-4 py-2.5 text-sm font-semibold"
						style="background:var(--primary);color:var(--on-primary)"
					>
						Post
					</button>
				</form>
			</div>
		</div>
	{/if}
{:else}
	<!-- Hero -->
	<div class="px-5 pb-8 pt-12 text-center sm:px-8 sm:pb-12 sm:pt-16">
		<span
			class="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
			style="background:var(--surface);color:var(--text-muted)"
		>
			GT Dining · Ranked by you
		</span>

		<h1 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl" style="color:var(--text)">
			Meal<span style="color:var(--primary)">Wise</span>
		</h1>

		<p class="mx-auto mt-3 max-w-sm text-base leading-relaxed sm:max-w-md sm:text-lg" style="color:var(--text-muted)">
			The dining hall social feed built for Georgia Tech.
			Post your plate, rate your food, find what's worth the walk.
		</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<a
				href="/login"
				class="rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
				style="background:var(--primary);color:var(--on-primary)"
			>
				Create account
			</a>
			<a
				href="/login"
				class="rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
				style="background:var(--surface);color:var(--text)"
			>
				Sign in
			</a>
		</div>
	</div>

	<!-- Scrolling post-card rows -->
	<div class="flex flex-col gap-4 overflow-hidden pb-10">
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
						class="flex-none overflow-hidden rounded-xl"
						style="width:{CARD_W}px; margin-right:{CARD_GAP}px; background:var(--surface);"
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
							<p class="truncate text-base font-semibold leading-tight" style="color:var(--text)">{post.name}</p>
							<p class="mt-0.5 truncate text-sm" style="color:var(--text-muted)">{post.hall} · @{post.user}</p>
							<div class="mt-1">
								<StarRating value={post.rating} size="sm" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<p class="pb-8 text-center text-xs" style="color:var(--text-muted)">
		By Georgia Tech Students, For Georgia Tech Students
	</p>
{/if}
