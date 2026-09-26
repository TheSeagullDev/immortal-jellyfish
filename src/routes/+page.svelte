<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>MealWise</title>
</svelte:head>

{#if data.user}
	<h1 class="text-2xl font-bold tracking-tight" style="color:var(--primary)">
		Hey{data.user.user_metadata?.display_name
			? `, ${data.user.user_metadata.display_name}`
			: ''}
	</h1>
	<p class="mt-2 text-sm" style="color:var(--accent)">
		{#if data.user.user_metadata?.username}
			<span class="font-medium" style="color:var(--text)">@{data.user.user_metadata.username}</span>
			·
		{/if}
		{data.user.email}
	</p>
{:else}
	<div class="py-12 text-center">
		<h1 class="text-4xl font-bold tracking-tight" style="color:var(--primary)">MealWise</h1>
		<p class="mt-3 text-base" style="color:var(--accent)">
			Rate, review, and discover dining hall food at Georgia Tech.
		</p>
		<p class="mt-8">
			<a
				href="/login"
				class="inline-flex rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
				style="background:var(--primary)"
			>
				Get started
			</a>
		</p>
	</div>
{/if}
