<script>
	import { page } from '$app/state';
	import LoadedImage from './LoadedImage.svelte';
	import StarRating from './StarRating.svelte';

	let { halls = [], signedIn = false } = $props();

	let composerOpen = $state(false);
	let photoName = $state('');
	let photoPreview = $state('');

	const form = $derived(page.form);

	$effect(() => {
		if (form?.error && ('caption' in form || 'hallId' in form || 'rating' in form)) {
			composerOpen = true;
		}
	});

	function resetPhoto() {
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoName = '';
		photoPreview = '';
	}

	function openComposer() {
		if (!signedIn) {
			window.location.href = '/login';
			return;
		}
		composerOpen = true;
	}

	function closeComposer() {
		composerOpen = false;
		resetPhoto();
	}

	/**
	 * @param {Event} event
	 */
	function onPhotoChange(event) {
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		const file = input.files?.[0];
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoName = file?.name ?? '';
		photoPreview = file ? URL.createObjectURL(file) : '';
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function onComposerKeydown(event) {
		if (event.key === 'Escape') closeComposer();
	}
</script>

<svelte:window onkeydown={onComposerKeydown} />

<div>
	<button
		type="button"
		onclick={openComposer}
		aria-label="New post"
		style="
			position: fixed;
			right: 1.25rem;
			bottom: 1.25rem;
			z-index: 2147483646;
			display: grid;
			place-items: center;
			width: 3.5rem;
			height: 3.5rem;
			padding: 0;
			border: 0;
			border-radius: 9999px;
			background: var(--primary);
			color: var(--on-primary);
			box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 28%, transparent);
			cursor: pointer;
		"
	>
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" />
		</svg>
	</button>

	{#if composerOpen}
		<div
			style="
				position: fixed;
				inset: 0;
				z-index: 2147483645;
				display: flex;
				align-items: flex-end;
				justify-content: center;
				padding: 1rem;
			"
		>
			<button
				type="button"
				aria-label="Close new post"
				onclick={closeComposer}
				style="
					position: absolute;
					inset: 0;
					border: 0;
					background: color-mix(in srgb, var(--text) 40%, transparent);
					cursor: pointer;
				"
			></button>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="new-post-title"
				class="relative z-10 w-full max-w-md rounded-xl p-4"
				style="background:var(--background)"
			>
				<div class="mb-3 flex items-center justify-between">
					<p id="new-post-title" class="text-sm font-semibold">New post</p>
					<button
						type="button"
						class="rounded-md px-2 py-1 text-sm"
						style="background:var(--surface);color:var(--text-muted)"
						onclick={closeComposer}
					>
						Close
					</button>
				</div>

				<form method="POST" action="/?/create" enctype="multipart/form-data" class="space-y-3">
					{#if form?.error}
						<p
							class="rounded-md px-3 py-2 text-sm"
							style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16"
							role="alert"
						>
							{form.error}
						</p>
					{/if}

					<div class="block text-sm">
						<span class="mb-1 block font-medium">Photo</span>
						<input
							id="new-post-photo"
							type="file"
							name="image"
							accept="image/*"
							capture="environment"
							required
							class="sr-only"
							onchange={onPhotoChange}
						/>
						<label
							for="new-post-photo"
							class="flex cursor-pointer items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
							style="background:var(--surface);color:var(--primary)"
						>
							{photoName ? 'Change photo' : 'Choose photo'}
						</label>
						{#if photoPreview}
							<div class="photo-frame mt-2 overflow-hidden rounded-md">
								<LoadedImage src={photoPreview} class="h-full w-full object-contain" />
							</div>
						{/if}
						{#if photoName}
							<p class="mt-1.5 truncate text-xs" style="color:var(--text-muted)">{photoName}</p>
						{:else}
							<p class="mt-1.5 text-xs" style="color:var(--text-muted)">JPG or PNG from your camera roll</p>
						{/if}
					</div>

					<label class="block text-sm">
						<span class="mb-1 block font-medium">Caption</span>
						<input
							type="text"
							name="caption"
							value={form?.caption ?? ''}
							required
							maxlength="200"
							placeholder="What's on the tray?"
							class="block w-full rounded-md text-sm"
						/>
					</label>

					<div class="space-y-3">
						<label class="block text-sm">
							<span class="mb-1 block font-medium">Hall</span>
							<select name="dining_hall_id" required class="block w-full rounded-md text-sm">
								<option value="">Select</option>
								{#each halls as hall}
									<option value={hall.id} selected={form?.hallId === hall.id}>{hall.name}</option>
								{/each}
							</select>
						</label>

						<fieldset class="text-sm">
							<legend class="mb-1 font-medium">Rating</legend>
							<StarRating interactive name="rating" value={form?.rating ?? 0} />
						</fieldset>
					</div>

					<button
						type="submit"
						class="w-full rounded-md px-4 py-2.5 text-sm font-semibold"
						style="background:var(--primary);color:var(--on-primary)"
					>
						Post
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
