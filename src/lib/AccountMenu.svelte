<script>
	import { afterNavigate } from '$app/navigation';

	let { user } = $props();

	let open = $state(false);

	const profileHref = $derived(
		user?.user_metadata?.username ? `/u/${user.user_metadata.username}` : '/profile'
	);
	const label = $derived(user?.user_metadata?.display_name ?? user?.email ?? 'Account');

	afterNavigate(() => {
		open = false;
	});

	function toggle(event) {
		event.stopPropagation();
		open = !open;
	}

	function close() {
		open = false;
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function onKeydown(event) {
		if (event.key === 'Escape') close();
	}
</script>

<svelte:window onclick={close} onkeydown={onKeydown} />

<div class="relative">
	<button
		type="button"
		class="inline-flex max-w-[12rem] items-center gap-1 rounded-md px-2 py-1.5 text-sm"
		style="color:var(--text)"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={toggle}
	>
		<span class="truncate">{label}</span>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0">
			<path
				d="M6 9l6 6 6-6"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open}
		<div
			role="menu"
			class="absolute right-0 z-50 mt-1 min-w-40 overflow-hidden rounded-lg py-1"
			style="background:var(--background); box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 16%, transparent); border: 1px solid var(--muted)"
			onclick={(event) => event.stopPropagation()}
		>
			<a
				role="menuitem"
				href={profileHref}
				class="block px-3 py-2 text-sm font-medium"
				style="color:var(--primary)"
			>
				Profile
			</a>
			<a
				role="menuitem"
				href="/settings"
				class="block px-3 py-2 text-sm font-medium"
				style="color:var(--primary)"
			>
				Settings
			</a>
			<form method="POST" action="/logout">
				<button
					role="menuitem"
					type="submit"
					class="block w-full px-3 py-2 text-left text-sm font-bold"
					style="color:var(--primary);background:transparent"
				>
					Sign out
				</button>
			</form>
		</div>
	{/if}
</div>
