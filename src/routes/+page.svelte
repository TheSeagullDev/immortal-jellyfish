<script>
	import PostCard from '$lib/PostCard.svelte';
	import LoadedImage from '$lib/LoadedImage.svelte';
	import StarRating from '$lib/StarRating.svelte';

	let { data } = $props();

	let feedPosts = $state(/** @type {any[]} */ ([]));

	$effect(() => {
		feedPosts = (data.posts ?? []).map((post) => ({ ...post }));
	});

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
	const SET_SIZE = 8;
	const SET_W = SET_SIZE * PER_CARD; // 1632px

	const rows = [
		{
			dir: 'left',
			speed: 22,
			posts: [
				{ src: '/demo/carousel/brittain-chicken-pita.jpeg', name: 'Chicken Pita Plate', hall: 'Brittain', rating: 4.4, user: 'gburdell3' },
				{ src: '/demo/carousel/brittain-lo-mein.jpeg', name: 'Lo Mein & Salisbury', hall: 'Brittain', rating: 4.1, user: 'ramblinwreck' },
				{ src: '/demo/carousel/brittain-tofu-pork.jpeg', name: 'Tofu & Pork Belly', hall: 'Brittain', rating: 3.9, user: 'stinggt' },
				{ src: '/demo/carousel/brittain-chicken-green-beans.jpeg', name: 'Chicken, Pork & Pita', hall: 'Brittain', rating: 4.3, user: 'techie42' },
				{ src: '/demo/carousel/brittain-pita-fruit.jpeg', name: 'Pita, Tofu & Green Beans', hall: 'Brittain', rating: 4.0, user: 'buzzy99' },
				{ src: '/demo/carousel/brittain-fried-rice.jpeg', name: 'Fried Rice Bowl', hall: 'Brittain', rating: 4.2, user: 'csgt01' },
				{ src: '/demo/carousel/brittain-rice-broccoli.jpeg', name: 'Rice Bowl & Broccoli', hall: 'Brittain', rating: 4.5, user: 'gabby22' },
				{ src: '/demo/carousel/brittain-pulled-chicken-pita.jpeg', name: 'Pulled Chicken Pita', hall: 'Brittain', rating: 4.6, user: 'yellojkt' },
			]
		},
		{
			dir: 'right',
			speed: 18,
			posts: [
				{ src: '/demo/carousel/north-ave-dessert-pizza.jpeg', name: 'PB&J Dessert Pizza', hall: 'North Ave', rating: 4.7, user: 'engineerx' },
				{ src: '/demo/carousel/north-ave-chicken-cauliflower.jpeg', name: 'Chicken & Cauliflower', hall: 'North Ave', rating: 4.3, user: 'rambler5' },
				{ src: '/demo/carousel/north-ave-chicken-pita.jpeg', name: 'Chicken Pita Plate', hall: 'North Ave', rating: 4.4, user: 'csgt01' },
				{ src: '/demo/carousel/north-ave-breakfast-plate.jpeg', name: 'Breakfast Plate', hall: 'North Ave', rating: 4.1, user: 'jdoe9' },
				{ src: '/demo/carousel/north-ave-roast-chicken.jpeg', name: 'Roast Chicken Plate', hall: 'North Ave', rating: 4.0, user: 'gburdell3' },
				{ src: '/demo/carousel/north-ave-oreo-donut.jpeg', name: 'Cookies & Cream Donut', hall: 'North Ave', rating: 4.8, user: 'techie42' },
				{ src: '/demo/carousel/west-village-tofu-pork.jpeg', name: 'Tofu & Pork Bowl', hall: 'West Village', rating: 4.2, user: 'stinggt' },
				{ src: '/demo/carousel/west-village-fruit-cup.jpeg', name: 'Fruit Cup', hall: 'West Village', rating: 4.5, user: 'gabby22' },
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
				href="/signup"
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
							<LoadedImage
								src={post.src}
								alt={post.name}
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
