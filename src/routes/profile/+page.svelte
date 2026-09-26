<script>
	let { data } = $props();

	const joinedLabel = $derived(
		data.profile.joinedAt
			? new Date(data.profile.joinedAt).toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric'
				})
			: ''
	);
</script>

<svelte:head>
	<title>{data.profile.displayName} · MealWise</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6">
	<p class="text-sm">
		<a href="/" class="opacity-60 hover:opacity-100">← Feed</a>
	</p>

	<header class="mt-4">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--primary)">
			{data.profile.displayName}
		</h1>
		<p class="mt-1 text-sm" style="color:var(--accent)">
			{#if data.profile.username}
				@{data.profile.username}
			{/if}
			{#if joinedLabel}
				{#if data.profile.username}
					<span class="opacity-50" style="color:var(--text)"> · </span>
				{/if}
				<span class="opacity-60" style="color:var(--text)">Joined {joinedLabel}</span>
			{/if}
		</p>
	</header>

	<section class="mt-8">
		<h2 class="text-sm font-semibold uppercase tracking-wide opacity-60">Posts</h2>

		{#if data.postsError}
			<p class="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
				{data.postsError}
			</p>
		{:else if !data.posts?.length}
			<p class="mt-6 text-sm opacity-50">No posts yet.</p>
		{:else}
			<div class="mt-4 space-y-4">
				{#each data.posts as post (post.id)}
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
								{post.hallName} · {post.postedAt}
							</p>
							<p class="text-sm font-medium" style="color:var(--accent)">{post.rating} / 5</p>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</div>
