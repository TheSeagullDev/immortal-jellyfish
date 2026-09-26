<script>
	let {
		value = 0,
		interactive = false,
		name = 'rating',
		size = 'md'
	} = $props();

	let hover = $state(0);
	const filled = $derived(
		interactive && hover ? hover : Math.round(Number(value) || 0)
	);
	const dim = $derived(size === 'sm' ? 18 : 22);
</script>

<div
	class="inline-flex items-center"
	style="gap: 2px; color: var(--star)"
	role={interactive ? 'group' : 'img'}
	aria-label="{filled} out of 5 stars"
>
	{#each [1, 2, 3, 4, 5] as n}
		{#if interactive}
			<label
				class="cursor-pointer leading-none"
				onmouseenter={() => (hover = n)}
				onmouseleave={() => (hover = 0)}
			>
				<input
					type="radio"
					{name}
					value={n}
					class="sr-only"
					required
					checked={Number(value) === n}
				/>
				<svg
					width={dim}
					height={dim}
					viewBox="0 0 24 24"
					aria-hidden="true"
					style="fill: {n <= filled ? 'var(--star)' : 'var(--muted)'}"
				>
					<path
						d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
					/>
				</svg>
				<span class="sr-only">{n}</span>
			</label>
		{:else}
			<svg
				width={dim}
				height={dim}
				viewBox="0 0 24 24"
				aria-hidden="true"
				style="fill: {n <= filled ? 'var(--star)' : 'var(--muted)'}"
			>
				<path
					d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
				/>
			</svg>
		{/if}
	{/each}
</div>
