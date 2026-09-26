<script>
	let {
		src = '',
		alt = '',
		class: className = 'h-full w-full object-cover',
		width = undefined,
		height = undefined,
		loading = 'lazy'
	} = $props();

	let loaded = $state(false);
	/** @type {HTMLImageElement | undefined} */
	let el = $state();

	$effect(() => {
		void src;
		loaded = false;
		queueMicrotask(() => {
			if (el?.complete && el.naturalWidth > 0) loaded = true;
		});
	});
</script>

<div class="img-skeleton" class:is-loaded={loaded}>
	{#if src}
		<img
			bind:this={el}
			{src}
			{alt}
			{width}
			{height}
			{loading}
			class={className}
			onload={() => (loaded = true)}
			onerror={() => (loaded = true)}
		/>
	{/if}
</div>
