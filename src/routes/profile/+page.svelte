<script>
	import StarRating from '$lib/StarRating.svelte';
	import { formatRelativeTime } from '$lib/posts.js';

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
		<a href="/" class="hover:opacity-80" style="color:var(--text-muted)">← Feed</a>
	</p>

	<header class="mt-4">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--text)">
			{data.profile.displayName}
		</h1>
		<p class="mt-1 text-sm" style="color:var(--text-muted)">
			{#if data.profile.username}
				@{data.profile.username}
			{/if}
			{#if joinedLabel}
				{#if data.profile.username}
					<span> · </span>
				{/if}
				<span>Joined {joinedLabel}</span>
			{/if}
		</p>
	</header>

	<section class="mt-8">
		<h2 class="text-sm font-semibold uppercase tracking-wide" style="color:var(--text-muted)">Posts</h2>

		{#if data.postsError}
			<p class="mt-4 rounded-md px-3 py-2 text-sm" style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16">
				{data.postsError}
			</p>
		{:else if !data.posts?.length}
			<p class="mt-6 text-sm" style="color:var(--text-muted)">No posts yet.</p>
		{:else}
			<div class="mt-4 space-y-4">
				{#each data.posts as post (post.id)}
					<article class="overflow-hidden rounded-xl" style="background:var(--surface)">
						<div class="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
							<p class="min-w-0 truncate text-base">
								<span class="font-medium">@{post.username}</span>
								<span style="color:var(--text-muted)"> · {post.hallName}</span>
							</p>
							<StarRating value={post.rating} />
						</div>
						{#if post.imageUrl}
							<div class="photo-frame">
								<img src={post.imageUrl} alt="" />
							</div>
						{/if}
						<div class="space-y-2 p-3">
							<p class="text-base leading-snug">{post.caption}</p>
							<p class="text-sm" style="color:var(--text-muted)">{formatRelativeTime(post.createdAt)}</p>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</div>
