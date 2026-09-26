<script>
	let {
		value = 0,
		interactive = false,
		name = 'rating',
		size = 'md',
		onSelect = undefined
	} = $props();

	let hover = $state(0);
	let selected = $state(Math.round(Number(value) || 0));

	const filled = $derived(
		interactive
			? hover || selected || Math.round(Number(value) || 0)
			: Math.round(Number(value) || 0)
	);
	const dim = $derived(size === 'sm' ? 18 : 22);
	const activeFill = 'var(--primary)';

	/**
	 * @param {number} n
	 */
	function choose(n) {
		selected = n;
		onSelect?.(n);
	}
</script>

<div
	class="relative z-20 inline-flex items-center"
	style="gap: 2px; cursor: {interactive ? 'pointer' : 'default'}"
	role={interactive ? 'radiogroup' : 'img'}
	aria-label="{filled} out of 5 stars"
>
	{#if interactive}
		<input type="hidden" {name} value={selected} />
	{/if}
	{#each [1, 2, 3, 4, 5] as n (n)}
		{#if interactive}
			<button
				type="button"
				class="inline-flex cursor-pointer rounded p-0.5 leading-none"
				style="background:transparent;border:0;cursor:pointer"
				aria-label="{n} star{n === 1 ? '' : 's'}"
				aria-pressed={selected === n}
				onmouseenter={() => (hover = n)}
				onmouseleave={() => (hover = 0)}
				onclick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					choose(n);
				}}
			>
				<svg
					width={dim}
					height={dim}
					viewBox="0 0 24 24"
					aria-hidden="true"
					style="pointer-events: none; fill: {n <= filled ? activeFill : 'var(--star-empty)'}"
				>
					<path
						d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
					/>
				</svg>
			</button>
		{:else}
			<svg
				width={dim}
				height={dim}
				viewBox="0 0 24 24"
				aria-hidden="true"
				style="fill: {n <= filled ? activeFill : 'var(--star-empty)'}"
			>
				<path
					d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
				/>
			</svg>
		{/if}
	{/each}
</div>
