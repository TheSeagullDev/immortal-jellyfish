<script>
	import { enhance } from '$app/forms';
	import PersonAvatar from './PersonAvatar.svelte';
	import LoadedImage from './LoadedImage.svelte';
	import StarRating from './StarRating.svelte';
	import { formatRelativeTime } from './posts.js';

	let { post, likeEnhance = undefined, showHeart = true } = $props();
</script>

<article class="overflow-hidden rounded-xl" style="background:var(--surface)">
	<div class="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
		{#if post.username}
			<a href="/u/{post.username}" class="flex min-w-0 items-center gap-2">
				<PersonAvatar src={post.avatarUrl} size="sm" />
				<p class="min-w-0 truncate text-base">
					<span class="font-medium">@{post.username}</span>
					<span style="color:var(--text-muted)"> · {post.hallName}</span>
				</p>
			</a>
		{:else}
			<div class="flex min-w-0 items-center gap-2">
				<PersonAvatar src={post.avatarUrl} size="sm" />
				<p class="min-w-0 truncate text-base">
					<span style="color:var(--text-muted)">{post.hallName}</span>
				</p>
			</div>
		{/if}
		<StarRating value={post.rating} />
	</div>
	{#if post.imageUrl}
		<div class="photo-frame">
			<LoadedImage src={post.imageUrl} />
		</div>
	{/if}
	<div class="space-y-2 p-3">
		<p class="text-base leading-snug">{post.caption}</p>
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
						class="inline-flex items-center gap-1.5 text-base"
						style="color: {post.liked ? 'var(--primary)' : 'var(--text-muted)'}"
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
	</div>
</article>
