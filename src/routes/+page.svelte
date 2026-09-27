<script>
	import PostCard from '$lib/PostCard.svelte';
	import LoadedImage from '$lib/LoadedImage.svelte';
	import StarRating from '$lib/StarRating.svelte';
	import { foodTagCounts, foodTagIsActive, postMatchesSearch } from '$lib/posts.js';
	import logo from '$lib/assets/logo.png';

	let { data } = $props();

	/** @type {Record<string, { liked: boolean, likeCount: number }>} */
	let likeOverrides = $state({});

	const feedPosts = $derived(
		(data.posts ?? []).map((post) => {
			const over = likeOverrides[post.id];
			return over ? { ...post, liked: over.liked, likeCount: over.likeCount } : post;
		})
	);

	let search = $state('');
	/** @type {'new' | 'top' | 'rated'} */
	let sort = $state('new');
	let hallFilter = $state('all');

	const hallFiltered = $derived(
		hallFilter === 'all'
			? feedPosts
			: feedPosts.filter((post) => post.hallName === hallFilter)
	);

	const visiblePosts = $derived.by(() => {
		const matched = hallFiltered.filter((post) => postMatchesSearch(post, search));
		const list = [...matched];
		if (sort === 'top') {
			list.sort(
				(a, b) => b.likeCount - a.likeCount || String(b.createdAt).localeCompare(String(a.createdAt))
			);
		} else if (sort === 'rated') {
			list.sort(
				(a, b) => b.rating - a.rating || b.likeCount - a.likeCount || String(b.createdAt).localeCompare(String(a.createdAt))
			);
		} else {
			list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
		}
		return list;
	});

	const tagSuggestions = $derived.by(() => {
		const all = foodTagCounts(hallFiltered);
		const q = search.trim().toLowerCase();
		if (!q) return all.slice(0, 10);
		return all.filter((tag) => tag.name.toLowerCase().includes(q)).slice(0, 10);
	});

	/**
	 * @param {string} name
	 */
	function useFoodTag(name) {
		search = name;
	}

	/**
	 * @param {any} post
	 */
	function likeEnhance(post) {
		return () => {
			const shown = likeOverrides[post.id] ?? { liked: post.liked, likeCount: post.likeCount };
			const liked = !shown.liked;
			likeOverrides = {
				...likeOverrides,
				[post.id]: { liked, likeCount: shown.likeCount + (liked ? 1 : -1) }
			};

			return async ({ result, update }) => {
				if (result.type === 'failure' || result.type === 'error') {
					const next = { ...likeOverrides };
					delete next[post.id];
					likeOverrides = next;
					return;
				}
				await update();
				const next = { ...likeOverrides };
				delete next[post.id];
				likeOverrides = next;
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

		<label class="mt-4 block">
			<span class="sr-only">Search the feed</span>
			<input
				type="search"
				bind:value={search}
				placeholder="Food, hall, @user, caption…"
				class="block w-full rounded-md text-sm"
			/>
		</label>
		<div class="mt-2 flex flex-wrap gap-2">
			<label class="flex min-w-[8.5rem] flex-1 items-center gap-2 text-sm">
				<span class="sr-only">Sort</span>
				<select bind:value={sort} class="w-full rounded-md text-sm">
					<option value="new">New</option>
					<option value="top">Top</option>
					<option value="rated">Top rated</option>
				</select>
			</label>
			<label class="flex min-w-[8.5rem] flex-1 items-center gap-2 text-sm">
				<span class="sr-only">Dining hall</span>
				<select bind:value={hallFilter} class="w-full rounded-md text-sm">
					<option value="all">All halls</option>
					{#each data.halls ?? [] as hall (hall.id)}
						<option value={hall.name}>{hall.name}</option>
					{/each}
				</select>
			</label>
		</div>
		{#if tagSuggestions.length}
			<p class="mt-2 flex flex-wrap gap-1.5">
				{#each tagSuggestions as tag (tag.name)}
					<button
						type="button"
						class="rounded-full px-2.5 py-1 text-xs font-medium"
						style={foodTagIsActive(tag.name, search)
							? 'background:var(--primary);color:var(--on-primary);border:0;cursor:pointer'
							: 'background:var(--surface);color:var(--text);border:0;cursor:pointer'}
						onclick={() => useFoodTag(tag.name)}
					>
						{tag.name}
						<span style="opacity:0.7">{tag.count}</span>
					</button>
				{/each}
			</p>
		{/if}

		{#if data.feedError}
			<p class="mt-4 rounded-md px-3 py-2 text-sm" style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16">
				{data.feedError}
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#if visiblePosts.length !== feedPosts.length}
					<p class="text-sm" style="color:var(--text-muted)">
						{visiblePosts.length} of {feedPosts.length} posts
					</p>
				{/if}
				{#each visiblePosts as post (post.id)}
					<PostCard
						{post}
						{likeEnhance}
						currentUserId={data.user.id}
						searchQuery={search}
						onFoodTag={useFoodTag}
					/>
				{/each}
				{#if !visiblePosts.length}
					<p class="text-sm" style="color:var(--text-muted)">No posts match those filters.</p>
				{/if}
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

		<img
			src={logo}
			alt=""
			width="128"
			height="119"
			class="mx-auto mt-6 h-24 w-24 object-contain sm:h-32 sm:w-32"
		/>

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
