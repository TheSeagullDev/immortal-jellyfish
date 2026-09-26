<script>
	import { enhance } from '$app/forms';
	import PersonAvatar from '$lib/PersonAvatar.svelte';
	import LoadedImage from '$lib/LoadedImage.svelte';
	import PostCard from '$lib/PostCard.svelte';

	let { data, form } = $props();

	let localPreview = $state('');
	let editingIdentity = $state(false);
	/** @type {string | null} */
	let openedId = $state(null);
	let dragX = $state(0);
	let dragging = $state(false);
	let animating = $state(false);
	let skipTransition = $state(false);
	let paneW = $state(0);

	let swipeStartX = 0;
	let swipeStartY = 0;
	/** @type {'x' | 'y' | null} */
	let swipeAxis = null;
	/** @type {HTMLElement | undefined} */
	let trackEl;

	const joinedLabel = $derived(
		data.profile.joinedAt
			? new Date(data.profile.joinedAt).toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric'
				})
			: ''
	);

	const avatarSrc = $derived(localPreview || data.profile.avatarUrl || '');
	const tabPosts = $derived(data.tab === 'liked' ? data.likedPosts : data.posts);
	const openedIndex = $derived(
		openedId ? tabPosts.findIndex((post) => post.id === openedId) : -1
	);
	const openedPost = $derived(openedIndex >= 0 ? tabPosts[openedIndex] : null);
	const canPrev = $derived(openedIndex > 0);
	const canNext = $derived(openedIndex >= 0 && openedIndex < tabPosts.length - 1);
	const prevPost = $derived(canPrev ? tabPosts[openedIndex - 1] : null);
	const nextPost = $derived(canNext ? tabPosts[openedIndex + 1] : null);

	$effect(() => {
		if (form?.error && (form.displayName || form.username)) editingIdentity = true;
	});

	/**
	 * @param {number} delta
	 */
	function go(delta) {
		if (animating || dragging) return;
		if (delta > 0 && !canNext) return;
		if (delta < 0 && !canPrev) return;
		settleTo(delta > 0 ? -(paneW || 360) : paneW || 360, delta);
	}

	/**
	 * @param {number} px
	 * @param {number} delta
	 */
	function settleTo(px, delta) {
		if (animating) return;
		animating = true;
		dragging = false;
		const track = trackEl;
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			skipTransition = true;
			openedId = tabPosts[openedIndex + delta]?.id ?? null;
			dragX = 0;
			animating = false;
			requestAnimationFrame(() => {
				skipTransition = false;
			});
		};
		if (!track) {
			finish();
			return;
		}
		/** @param {TransitionEvent} event */
		const onEnd = (event) => {
			if (event.target !== track || event.propertyName !== 'transform') return;
			track.removeEventListener('transitionend', onEnd);
			clearTimeout(timeout);
			finish();
		};
		const timeout = setTimeout(() => {
			track.removeEventListener('transitionend', onEnd);
			finish();
		}, 450);
		track.addEventListener('transitionend', onEnd);
		dragX = px;
	}

	function closePost() {
		openedId = null;
		dragX = 0;
		dragging = false;
		animating = false;
		swipeAxis = null;
	}

	let seenTab = data.tab;
	$effect(() => {
		if (data.tab === seenTab) return;
		seenTab = data.tab;
		closePost();
	});

	/**
	 * @param {TouchEvent} event
	 */
	function onSwipeStart(event) {
		if (animating) return;
		const touch = event.changedTouches[0];
		if (!touch) return;
		swipeStartX = touch.clientX;
		swipeStartY = touch.clientY;
		dragging = true;
		swipeAxis = null;
		dragX = 0;
	}

	/**
	 * @param {TouchEvent} event
	 */
	function onSwipeMove(event) {
		if (!dragging) return;
		const touch = event.changedTouches[0];
		if (!touch) return;
		const dx = touch.clientX - swipeStartX;
		const dy = touch.clientY - swipeStartY;
		if (!swipeAxis) {
			if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
			swipeAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
		}
		if (swipeAxis !== 'x') return;
		event.preventDefault();
		const atStart = !canPrev && dx > 0;
		const atEnd = !canNext && dx < 0;
		dragX = atStart || atEnd ? dx * 0.22 : dx;
	}

	function onSwipeEnd() {
		if (!dragging) return;
		dragging = false;
		if (swipeAxis === 'x') {
			const width = paneW || 360;
			if (dragX < -56 && canNext) settleTo(-width, 1);
			else if (dragX > 56 && canPrev) settleTo(width, -1);
			else dragX = 0;
		} else {
			dragX = 0;
		}
		swipeAxis = null;
	}

	/**
	 * @param {HTMLElement} node
	 */
	function swipeSurface(node) {
		/** @param {TouchEvent} event */
		const move = (event) => onSwipeMove(event);
		node.addEventListener('touchstart', onSwipeStart, { passive: true });
		node.addEventListener('touchmove', move, { passive: false });
		node.addEventListener('touchend', onSwipeEnd);
		node.addEventListener('touchcancel', onSwipeEnd);
		return {
			destroy() {
				node.removeEventListener('touchstart', onSwipeStart);
				node.removeEventListener('touchmove', move);
				node.removeEventListener('touchend', onSwipeEnd);
				node.removeEventListener('touchcancel', onSwipeEnd);
			}
		};
	}

	/**
	 * @param {Event} event
	 */
	function onAvatarChange(event) {
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		const file = input.files?.[0];
		if (localPreview) URL.revokeObjectURL(localPreview);
		localPreview = file ? URL.createObjectURL(file) : '';
		if (file) input.form?.requestSubmit();
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function onKeydown(event) {
		if (!openedPost) return;
		if (event.key === 'Escape') closePost();
		if (event.key === 'ArrowLeft') go(-1);
		if (event.key === 'ArrowRight') go(1);
	}
</script>

<svelte:head>
	<title>{data.profile.displayName} · MealWise</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="pb-24">
	<p class="text-sm">
		<a href="/" class="hover:opacity-80" style="color:var(--text-muted)">← Feed</a>
	</p>

	<header class="mt-4">
		{#if data.isOwn}
			<form
				method="POST"
				action="?/avatar"
				enctype="multipart/form-data"
				class="mb-4 w-fit"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success' && localPreview) {
							URL.revokeObjectURL(localPreview);
							localPreview = '';
						}
					};
				}}
			>
				<input
					id="profile-avatar"
					type="file"
					name="avatar"
					accept="image/*"
					class="sr-only"
					onchange={onAvatarChange}
				/>
				<label for="profile-avatar" class="avatar-edit h-36 w-36 cursor-pointer">
					<PersonAvatar src={avatarSrc} size="lg" />
					<span class="avatar-edit-overlay">Edit your profile photo</span>
				</label>
			</form>
		{:else}
			<div class="mb-4">
				<PersonAvatar src={avatarSrc} size="lg" />
			</div>
		{/if}

		{#if form?.error}
			<p class="mb-3 rounded-md px-3 py-2 text-sm" style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16">
				{form.error}
			</p>
		{/if}

		{#if data.isOwn && editingIdentity}
			<form
				method="POST"
				action="?/identity"
				class="space-y-2"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success' || result.type === 'redirect') editingIdentity = false;
					};
				}}
			>
				<label class="block text-sm">
					<span class="mb-1 block font-medium">Name</span>
					<input
						name="display_name"
						required
						value={form?.displayName ?? data.profile.displayName}
						class="block w-full max-w-sm rounded-md"
					/>
				</label>
				<label class="block text-sm">
					<span class="mb-1 block font-medium">Username</span>
					<input
						name="username"
						required
						minlength="3"
						maxlength="20"
						value={form?.username ?? data.profile.username}
						class="block w-full max-w-sm rounded-md"
					/>
				</label>
				<div class="flex gap-2">
					<button
						type="submit"
						class="rounded-md px-3 py-1.5 text-sm font-medium"
						style="background:var(--primary);color:var(--on-primary)"
					>
						Save
					</button>
					<button
						type="button"
						class="rounded-md px-3 py-1.5 text-sm"
						style="background:var(--surface);color:var(--text-muted)"
						onclick={() => (editingIdentity = false)}
					>
						Cancel
					</button>
				</div>
			</form>
		{:else}
			<div>
				<h1 class="flex items-center gap-1 text-2xl font-bold tracking-tight" style="color:var(--text)">
					<span>{data.profile.displayName}</span>
					{#if data.isOwn}
						<button
							type="button"
							class="inline-flex shrink-0 rounded-md p-1"
							style="color:var(--text-muted)"
							aria-label="Edit name and username"
							onclick={() => (editingIdentity = true)}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					{/if}
				</h1>
				<p class="mt-1 text-base" style="color:var(--text-muted)">
					@{data.profile.username}
					{#if joinedLabel}
						<span> · Joined {joinedLabel}</span>
					{/if}
				</p>
			</div>
		{/if}

		<div class="mt-4 flex flex-wrap gap-2">
			{#if data.isOwn}
				{#each data.halls as hall}
					<form method="POST" action="?/favoriteHall" use:enhance>
						<input type="hidden" name="hall_id" value={hall.id} />
						<button
							type="submit"
							class="rounded-full px-3 py-1 text-sm"
							style={data.profile.favoriteHallId === hall.id
								? 'background:var(--primary);color:var(--on-primary)'
								: 'background:var(--surface);color:var(--text-muted)'}
						>
							{hall.name}
						</button>
					</form>
				{/each}
			{:else if data.profile.favoriteHallName}
				<span class="rounded-full px-3 py-1 text-sm" style="background:var(--surface);color:var(--text)">
					{data.profile.favoriteHallName}
				</span>
			{/if}
		</div>
	</header>

	<nav class="mt-8 flex gap-1 rounded-lg p-1" style="background:var(--surface)">
		<a
			href="/u/{data.profile.username}"
			class="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium"
			style={data.tab === 'posts'
				? 'background:var(--primary);color:var(--on-primary)'
				: 'color:var(--text-muted)'}
		>
			Posts
		</a>
		<a
			href="/u/{data.profile.username}?tab=liked"
			class="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium"
			style={data.tab === 'liked'
				? 'background:var(--primary);color:var(--on-primary)'
				: 'color:var(--text-muted)'}
		>
			Liked
		</a>
	</nav>

	<section class="mt-4">
		{#if data.postsError}
			<p class="rounded-md px-3 py-2 text-sm" style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16">
				{data.postsError}
			</p>
		{:else if !tabPosts?.length}
			<p class="py-8 text-center text-sm" style="color:var(--text-muted)">
				{data.tab === 'liked' ? 'No liked posts yet.' : 'No posts yet.'}
			</p>
		{:else}
			<div class="grid grid-cols-3 gap-1">
				{#each tabPosts as post (post.id)}
					<button
						type="button"
						class="block aspect-square w-full overflow-hidden"
						style="background:var(--muted)"
						onclick={() => (openedId = post.id)}
					>
						{#if post.imageUrl}
							<LoadedImage src={post.imageUrl} />
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</section>
</div>

{#if openedPost}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0"
			style="background:color-mix(in srgb, var(--text) 40%, transparent)"
			aria-label="Close post"
			onclick={closePost}
		></button>
		<div class="relative z-10 w-full max-w-md overflow-hidden" bind:clientWidth={paneW} use:swipeSurface>
			{#if tabPosts.length > 1}
				<p class="mb-2 text-center text-xs font-medium" style="color:var(--on-primary)">
					{openedIndex + 1} / {tabPosts.length}
				</p>
			{/if}
			<div
				bind:this={trackEl}
				class="flex"
				style="
					width: 300%;
					transform: translateX(calc(-33.333% + {dragX}px));
					transition: {dragging || skipTransition
						? 'none'
						: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'};
					will-change: transform;
					touch-action: pan-y;
				"
			>
				<div class="w-1/3 shrink-0 px-1" style="opacity:{prevPost ? 0.45 : 0}; transform: scale(0.94);">
					{#if prevPost}
						<div class="max-h-[85dvh] overflow-hidden rounded-xl pointer-events-none">
							<PostCard post={prevPost} showHeart={false} />
						</div>
					{/if}
				</div>
				<div class="w-1/3 shrink-0 px-1">
					<div class="max-h-[85dvh] overflow-y-auto rounded-xl">
						<PostCard post={openedPost} showHeart={Boolean(data.user)} />
					</div>
				</div>
				<div class="w-1/3 shrink-0 px-1" style="opacity:{nextPost ? 0.45 : 0}; transform: scale(0.94);">
					{#if nextPost}
						<div class="max-h-[85dvh] overflow-hidden rounded-xl pointer-events-none">
							<PostCard post={nextPost} showHeart={false} />
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
