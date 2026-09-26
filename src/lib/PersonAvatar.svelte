<script>
	import LoadedImage from './LoadedImage.svelte';

	let { src = '', size = 'md', alt = '' } = $props();

	const px = $derived(size === 'sm' ? 28 : size === 'lg' ? 144 : 40);
	const icon = $derived(size === 'sm' ? 16 : size === 'lg' ? 72 : 22);
</script>

<div
	class="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
	style="width:{px}px;height:{px}px;background:var(--surface);color:var(--text-muted)"
>
	{#if src}
		<LoadedImage {src} {alt} />
	{:else}
		<svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.6" />
			<path
				d="M5 19.2c.8-3.3 3.4-5 7-5s6.2 1.7 7 5"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
		</svg>
	{/if}
</div>
