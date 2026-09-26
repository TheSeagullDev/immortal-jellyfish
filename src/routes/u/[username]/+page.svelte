<script>
	import { enhance } from '$app/forms';
	import PersonAvatar from '$lib/PersonAvatar.svelte';
	import PostCard from '$lib/PostCard.svelte';

	let { data, form } = $props();

	let localPreview = $state('');
	let editingIdentity = $state(false);
	/** @type {any | null} */
	let openedPost = $state(null);

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

	$effect(() => {
		if (form?.error && (form.displayName || form.username)) editingIdentity = true;
	});

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
		if (event.key === 'Escape') openedPost = null;
	}
</script>

<svelte:head>
	<title>{data.profile.displayName} · MealWise</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="mx-auto max-w-3xl px-4 py-6">
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
			<div class="flex items-start gap-2">
				<div>
					<h1 class="text-2xl font-bold tracking-tight" style="color:var(--text)">
						{data.profile.displayName}
					</h1>
					<p class="mt-1 text-base" style="color:var(--text-muted)">
						@{data.profile.username}
						{#if joinedLabel}
							<span> · Joined {joinedLabel}</span>
						{/if}
					</p>
				</div>
				{#if data.isOwn}
					<button
						type="button"
						class="mt-1 rounded-md p-1.5"
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
						class="aspect-square overflow-hidden"
						style="background:var(--muted)"
						onclick={() => (openedPost = post)}
					>
						{#if post.imageUrl}
							<img src={post.imageUrl} alt="" class="h-full w-full object-cover" />
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
			onclick={() => (openedPost = null)}
		></button>
		<div class="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl">
			<PostCard post={openedPost} showHeart={Boolean(data.user)} />
		</div>
	</div>
{/if}
