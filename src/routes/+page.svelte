<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Dining Hall</title>
</svelte:head>

{#if data.user}
	<h1 class="text-2xl font-semibold tracking-tight">You're in</h1>
	<p class="mt-2 text-stone-600">
		Signed in as <span class="font-medium text-stone-900">{data.user.email}</span>.
	</p>
{:else}
	<h1 class="text-2xl font-semibold tracking-tight">Dining Hall</h1>
	<p class="mt-2 text-stone-600">Sign in with your Georgia Tech email to get started.</p>
	<p class="mt-6">
		<a
			href="/login"
			class="inline-flex rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
		>
			Sign in
		</a>
	</p>
{/if}
