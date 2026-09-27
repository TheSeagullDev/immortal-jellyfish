<script>
	import { enhance } from '$app/forms';
	import PersonAvatar from './PersonAvatar.svelte';
	import LoadedImage from './LoadedImage.svelte';
	import StarRating from './StarRating.svelte';
	import { foodTagIsActive, formatRelativeTime } from './posts.js';

	let {
		post,
		likeEnhance = undefined,
		showHeart = true,
		currentUserId = '',
		searchQuery = '',
		onFoodTag = undefined
	} = $props();

	const canDelete = $derived(Boolean(currentUserId && post.authorId === currentUserId));
	const comments = $derived(Array.isArray(post.comments) ? post.comments : []);
</script>

<article class="post-card overflow-hidden rounded-xl" style="background:var(--post-card)">
	<div class="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
		{#if post.username}
			<a href="/u/{post.username}" class="flex min-w-0 flex-1 items-center gap-2">
				<PersonAvatar src={post.avatarUrl} size="sm" />
				<p class="min-w-0 truncate text-base">
					<span class="font-medium">@{post.username}</span>
					<span style="color:var(--text-muted)"> · {post.hallName}</span>
				</p>
			</a>
		{:else}
			<div class="flex min-w-0 flex-1 items-center gap-2">
				<PersonAvatar src={post.avatarUrl} size="sm" />
				<p class="min-w-0 truncate text-base">
					<span style="color:var(--text-muted)">{post.hallName}</span>
				</p>
			</div>
		{/if}
		<div class="flex shrink-0 items-center gap-2">
			<StarRating value={post.rating} />
			{#if canDelete && showHeart}
				<form
					method="POST"
					action="/?/deletePost"
					use:enhance={() => async ({ result, update }) => {
						if (result.type === 'success') await update();
					}}
				>
					<input type="hidden" name="post_id" value={post.id} />
					<button
						type="submit"
						class="text-xs font-semibold"
						style="background:transparent;border:0;color:var(--text-muted);cursor:pointer"
						onclick={(event) => {
							if (!confirm('Delete this post?')) event.preventDefault();
						}}
					>
						Delete
					</button>
				</form>
			{/if}
		</div>
	</div>
	{#if post.imageUrl}
		<div class="photo-frame">
			<LoadedImage src={post.imageUrl} />
		</div>
	{/if}
	<div class="space-y-2 p-3">
		<p class="text-base leading-snug">{post.caption}</p>
		{#if post.foods?.length}
			<p class="flex flex-wrap gap-1">
				{#each post.foods as name}
					<button
						type="button"
						class="rounded-full px-2 py-0.5 text-xs"
						style={foodTagIsActive(name, searchQuery)
							? 'background:var(--primary);color:var(--on-primary);border:0;cursor:pointer'
							: 'background:var(--muted);color:var(--text-muted);border:0;cursor:pointer'}
						onclick={() => onFoodTag?.(name)}
					>
						{name}
					</button>
				{/each}
			</p>
		{/if}
		<div class="flex items-center justify-between gap-3">
			<p class="text-sm" style="color:var(--text-muted)">{formatRelativeTime(post.createdAt)}</p>
			{#if showHeart}
				<form
					method="POST"
					action={post.liked ? '/?/unlike' : '/?/like'}
					use:enhance={likeEnhance ? likeEnhance(post) : () => undefined}
				>
					<input type="hidden" name="post_id" value={post.id} />
					<button
						type="submit"
						class="like-heart inline-flex items-center gap-1.5 text-base {post.liked
							? 'is-liked'
							: ''}"
						aria-label={post.liked ? 'Unlike' : 'Like'}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							aria-hidden="true"
							fill={post.liked ? 'currentColor' : 'none'}
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
							/>
						</svg>
						{post.likeCount}
					</button>
				</form>
			{/if}
		</div>

		{#if showHeart}
		<div class="space-y-2 pt-1">
			{#each comments as comment (comment.id)}
				<p class="text-sm leading-snug">
					{#if comment.username}
						<a href="/u/{comment.username}" class="font-medium">@{comment.username}</a>
					{/if}
					{comment.body}
				</p>
			{/each}
			<form
				method="POST"
				action="/?/comment"
				class="flex gap-2"
				use:enhance={() => {
					return async ({ result, update, formElement }) => {
						await update();
						if (result.type === 'success') formElement.reset();
					};
				}}
			>
				<input type="hidden" name="post_id" value={post.id} />
				<input
					type="text"
					name="body"
					maxlength="280"
					required
					placeholder="Add a comment…"
					class="min-w-0 flex-1 rounded-md text-sm"
				/>
				<button
					type="submit"
					class="shrink-0 rounded-md px-2 py-1 text-xs font-semibold"
					style="background:var(--primary);color:var(--on-primary)"
				>
					Post
				</button>
			</form>
		</div>
		{/if}
	</div>
</article>
