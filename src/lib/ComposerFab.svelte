<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { compressPhotoForUpload, PHOTO_TOO_LARGE_MESSAGE } from '$lib/compress-image-browser.js';
	import LoadedImage from './LoadedImage.svelte';
	import ReportFlag from './ReportFlag.svelte';
	import StarRating from './StarRating.svelte';

	let { halls = [], signedIn = false } = $props();

	let composerOpen = $state(false);
	let photoName = $state('');
	let photoPreview = $state('');
	let rating = $state(0);
	let submitting = $state(false);
	let clientError = $state('');

	const form = $derived(page.form);

	$effect(() => {
		if (
			form?.error &&
			('caption' in form || 'hallId' in form || 'rating' in form || 'reportKind' in form)
		) {
			composerOpen = true;
			const n = Number(form.rating);
			if (n >= 1 && n <= 5) rating = n;
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
		if (submitting) return;
		composerOpen = false;
		rating = 0;
		clientError = '';
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

	/**
	 * @param {import('@sveltejs/kit').ActionResult} result
	 */
	function isPayloadTooLarge(result) {
		const status = 'status' in result ? result.status : 0;
		const text = JSON.stringify(result.error ?? '');
		return status === 413 || /payload|too large|413/i.test(text);
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
			z-index: 40;
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
				z-index: 50;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 1rem;
			"
		>
			<button
				type="button"
				aria-label="Close new post"
				disabled={submitting}
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
				class="relative z-10 w-full max-w-md overflow-y-auto rounded-xl p-4"
				style="background:var(--background);max-height:calc(100dvh - 2rem)"
			>
				<div class="mb-3 flex items-center justify-between">
					<p id="new-post-title" class="text-sm font-semibold">New post</p>
					<button
						type="button"
						class="rounded-md px-2 py-1 text-sm disabled:opacity-50"
						style="background:var(--surface);color:var(--text-muted)"
						disabled={submitting}
						onclick={closeComposer}
					>
						Close
					</button>
				</div>

				{#if clientError || form?.error}
					<div
						class="mb-3 rounded-md px-3 py-2 text-sm"
						style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16"
						role="alert"
					>
						<p>{clientError || form?.error}</p>
						{#if !clientError && form?.reportKind}
							<ReportFlag
								kind={form.reportKind}
								summary="User says this classification reject is incorrect"
								extra={{
									caption: form.caption ?? '',
									hallId: form.hallId ?? '',
									menuDate: form.menuDate ?? '',
									menuTime: form.menuTime ?? ''
								}}
							/>
						{/if}
					</div>
				{/if}

				<form
					method="POST"
					action="/?/create"
					enctype="multipart/form-data"
					class="space-y-3"
					aria-busy={submitting}
					use:enhance={async ({ formData, cancel }) => {
						if (submitting) {
							cancel();
							return;
						}
						submitting = true;
						clientError = '';
						const file = formData.get('image');
						try {
							if (file instanceof File && file.size > 0) {
								formData.set('image', await compressPhotoForUpload(file));
							}
						} catch {
							submitting = false;
							clientError = PHOTO_TOO_LARGE_MESSAGE;
							cancel();
							return;
						}
						return async ({ result, update }) => {
							submitting = false;
							if (result.type === 'success') {
								await update();
								closeComposer();
								return;
							}
							if (result.type === 'error' || isPayloadTooLarge(result)) {
								clientError = PHOTO_TOO_LARGE_MESSAGE;
								return;
							}
							await update();
						};
					}}
				>
					<fieldset class="m-0 min-w-full space-y-3 border-0 p-0" disabled={submitting}>
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
								<div class="composer-preview mt-2 overflow-hidden rounded-md">
									<LoadedImage src={photoPreview} class="h-full w-full object-contain" />
								</div>
							{/if}
							{#if photoName}
								<p class="mt-1.5 truncate text-xs" style="color:var(--text-muted)">{photoName}</p>
							{:else}
								<p class="mt-1.5 text-xs" style="color:var(--text-muted)">
									JPG or PNG from your camera roll
								</p>
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
								<select
									name="dining_hall_id"
									required
									class="edit-field block w-full rounded-md text-sm"
								>
									<option value="">Select</option>
									{#each halls as hall}
										<option value={hall.id} selected={form?.hallId === hall.id}>{hall.name}</option>
									{/each}
								</select>
							</label>

							<fieldset class="text-sm">
								<legend class="mb-1 font-medium">Rating</legend>
								<StarRating
									interactive
									name="rating"
									value={rating}
									onSelect={(n) => (rating = n)}
								/>
							</fieldset>
						</div>

						<div class="grid grid-cols-2 gap-3">
							<label class="block text-sm">
								<span class="mb-1 block font-medium"
									>Menu date <span class="font-normal" style="color:var(--text-muted)"
										>(optional)</span
									></span
								>
								<input
									type="date"
									name="menu_date"
									value={form?.menuDate ?? ''}
									class="block w-full rounded-md text-sm"
								/>
							</label>
							<label class="block text-sm">
								<span class="mb-1 block font-medium"
									>Time <span class="font-normal" style="color:var(--text-muted)">(optional)</span
									></span
								>
								<input
									type="time"
									name="menu_time"
									value={form?.menuTime ?? ''}
									class="block w-full rounded-md text-sm"
								/>
							</label>
						</div>
						<p class="text-xs" style="color:var(--text-muted)">
							Leave blank for today. Time picks breakfast / lunch / dinner for old photos.
						</p>

						<button
							type="submit"
							disabled={rating < 1 || submitting}
							class="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
							style="background:var(--primary);color:var(--on-primary)"
						>
							{#if submitting}
								<span class="btn-spinner" aria-hidden="true"></span>
								Posting…
							{:else}
								Post
							{/if}
						</button>
					</fieldset>
				</form>
			</div>
		</div>
	{/if}
</div>
