<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let editingName = $state(false);
	let editingUsername = $state(false);
	let editingPassword = $state(false);

	const profileHref = $derived(data.username ? `/u/${data.username}` : '/profile');
	const showNotice = $derived(
		Boolean(form?.notice) && !String(form.notice).includes('confirmation email')
	);

	$effect(() => {
		if (form?.error && form?.field === 'name') editingName = true;
		if (form?.error && form?.field === 'username') editingUsername = true;
		if (form?.error && form?.field === 'password') editingPassword = true;
		if (form?.updated === 'name') editingName = false;
		if (form?.updated === 'username') editingUsername = false;
		if (form?.updated === 'password') editingPassword = false;
	});
</script>

<svelte:head>
	<title>Settings · MealWise</title>
</svelte:head>

<section>
	<h1 class="text-2xl font-bold tracking-tight" style="color:var(--text)">Settings</h1>
	<p class="mt-2 text-sm" style="color:var(--text-muted)">Manage your MealWise account.</p>

	{#if showNotice}
		<p
			class="mt-4 rounded-md px-3 py-2 text-sm"
			style="background:var(--surface);color:var(--text)"
			role="status"
		>
			{form.notice}
		</p>
	{/if}

	{#if form?.error}
		<p
			class="mt-4 rounded-md px-3 py-2 text-sm"
			style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16"
			role="alert"
		>
			{form.error}
		</p>
	{/if}

	<div class="mt-6 space-y-4 rounded-xl p-4" style="background:var(--surface)">
		<div>
			<p class="text-sm font-medium" style="color:var(--text)">Email</p>
			<p class="mt-0.5 text-sm" style="color:var(--text-muted)">{data.email}</p>
		</div>

		<div>
			<div class="flex items-center">
				<p class="text-sm font-medium" style="color:var(--text)">Name</p>
				{#if !editingName}
					<button
						type="button"
						class="inline-flex p-0 pl-0.5"
						style="color:var(--text-muted)"
						aria-label="Edit name"
						onclick={() => (editingName = true)}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
								stroke="currentColor"
								stroke-width="1.7"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
			{#if editingName}
				<form
					method="POST"
					action="?/updateName"
					class="mt-2 space-y-2"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') editingName = false;
						};
					}}
				>
					<input
						name="display_name"
						required
						value={form?.displayName ?? data.displayName}
						class="edit-field block w-full max-w-sm rounded-md text-sm"
					/>
					<div class="flex gap-2">
						<button
							type="submit"
							class="rounded-md px-3 py-1.5 text-sm font-medium"
							style="background:var(--primary);color:var(--on-primary)"
						>
							Save
						</button>
						<button
							type="button"
							class="rounded-md px-3 py-1.5 text-sm"
							style="color:var(--text-muted)"
							onclick={() => (editingName = false)}
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<p class="mt-0.5 text-sm" style="color:var(--text-muted)">{data.displayName || '—'}</p>
			{/if}
		</div>

		<div>
			<div class="flex items-center">
				<p class="text-sm font-medium" style="color:var(--text)">Username</p>
				{#if !editingUsername}
					<button
						type="button"
						class="inline-flex p-0 pl-0.5"
						style="color:var(--text-muted)"
						aria-label="Edit username"
						onclick={() => (editingUsername = true)}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
								stroke="currentColor"
								stroke-width="1.7"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
			{#if editingUsername}
				<form
					method="POST"
					action="?/updateUsername"
					class="mt-2 space-y-2"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') editingUsername = false;
						};
					}}
				>
					<input
						name="username"
						required
						minlength="3"
						maxlength="20"
						value={form?.username ?? data.username}
						class="edit-field block w-full max-w-sm rounded-md text-sm"
					/>
					<div class="flex gap-2">
						<button
							type="submit"
							class="rounded-md px-3 py-1.5 text-sm font-medium"
							style="background:var(--primary);color:var(--on-primary)"
						>
							Save
						</button>
						<button
							type="button"
							class="rounded-md px-3 py-1.5 text-sm"
							style="color:var(--text-muted)"
							onclick={() => (editingUsername = false)}
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<p class="mt-0.5 text-sm" style="color:var(--text-muted)">
					{data.username ? `@${data.username}` : '—'}
				</p>
			{/if}
		</div>

		<div>
			<div class="flex items-center">
				<p class="text-sm font-medium" style="color:var(--text)">Change Password</p>
				{#if !editingPassword}
					<button
						type="button"
						class="inline-flex p-0 pl-0.5"
						style="color:var(--text-muted)"
						aria-label="Edit password"
						onclick={() => (editingPassword = true)}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
								stroke="currentColor"
								stroke-width="1.7"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
			{#if editingPassword}
				<form
					method="POST"
					action="?/changePassword"
					class="mt-2 max-w-sm space-y-3"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') editingPassword = false;
						};
					}}
				>
					<label class="block text-sm">
						<span class="mb-1 block font-medium">Old password</span>
						<input
							type="password"
							name="old_password"
							required
							autocomplete="current-password"
							class="edit-field block w-full rounded-md text-sm"
						/>
					</label>
					<label class="block text-sm">
						<span class="mb-1 block font-medium">New password</span>
						<input
							type="password"
							name="new_password"
							required
							minlength="6"
							autocomplete="new-password"
							class="edit-field block w-full rounded-md text-sm"
						/>
					</label>
					<label class="block text-sm">
						<span class="mb-1 block font-medium">Re-type new password</span>
						<input
							type="password"
							name="new_password_confirm"
							required
							minlength="6"
							autocomplete="new-password"
							class="edit-field block w-full rounded-md text-sm"
						/>
					</label>
					<div class="flex gap-2">
						<button
							type="submit"
							class="rounded-md px-3 py-1.5 text-sm font-medium"
							style="background:var(--primary);color:var(--on-primary)"
						>
							Save
						</button>
						<button
							type="button"
							class="rounded-md px-3 py-1.5 text-sm"
							style="color:var(--text-muted)"
							onclick={() => (editingPassword = false)}
						>
							Cancel
						</button>
					</div>
				</form>
			{:else}
				<p class="mt-0.5 text-sm" style="color:var(--text-muted)">********</p>
			{/if}
		</div>

		<a href={profileHref} class="inline-block text-sm font-medium" style="color:var(--primary)">
			View Profile
		</a>
	</div>
</section>
