<script>
	let { form, data } = $props();

	let modeOverride = $state(/** @type {'login' | 'signup' | null} */ (null));
	let mode = $derived(modeOverride ?? form?.mode ?? 'login');
</script>

<svelte:head>
	<title>{mode === 'signup' ? 'Create account' : 'Sign in'} · MealWise</title>
</svelte:head>

<section class="mx-auto max-w-md">
	<h1 class="text-2xl font-bold tracking-tight" style="color:var(--primary)">
		{mode === 'signup' ? 'Create account' : 'Sign in'}
	</h1>
	<p class="mt-2 text-sm" style="color:var(--accent)">
		Georgia Tech emails only (<span class="font-medium">@gatech.edu</span>).
	</p>

	{#if data.registered}
		<p
			class="mt-4 rounded-md border px-3 py-2 text-sm"
			style="border-color:var(--primary);background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary)"
			role="status"
		>
			Check your inbox to confirm your email, then sign in.
		</p>
	{/if}

	{#if form?.error}
		<p
			class="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
			role="alert"
		>
			{form.error}
		</p>
	{/if}

	<form method="POST" action="?/{mode}" class="mt-6 space-y-4">
		{#if mode === 'signup'}
			<label class="block text-sm">
				<span class="mb-1 block font-medium" style="color:var(--text)">Name</span>
				<input
					type="text"
					name="name"
					value={form?.name ?? ''}
					required
					autocomplete="name"
					placeholder="George P. Burdell"
					class="block w-full rounded-md shadow-sm"
					style="border-color:var(--secondary);focus:border-color:var(--primary)"
				/>
			</label>

			<label class="block text-sm">
				<span class="mb-1 block font-medium" style="color:var(--text)">Username</span>
				<input
					type="text"
					name="username"
					value={form?.username ?? ''}
					required
					minlength="3"
					maxlength="20"
					autocomplete="username"
					placeholder="gburdell"
					class="block w-full rounded-md shadow-sm"
					style="border-color:var(--secondary)"
				/>
			</label>
		{/if}

		<label class="block text-sm">
			<span class="mb-1 block font-medium" style="color:var(--text)">Email</span>
			<input
				type="email"
				name="email"
				value={form?.email ?? ''}
				required
				autocomplete="email"
				placeholder="gburdell3@gatech.edu"
				class="block w-full rounded-md shadow-sm"
				style="border-color:var(--secondary)"
			/>
		</label>

		<label class="block text-sm">
			<span class="mb-1 block font-medium" style="color:var(--text)">Password</span>
			<input
				type="password"
				name="password"
				required
				minlength="6"
				autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
				class="block w-full rounded-md shadow-sm"
				style="border-color:var(--secondary)"
			/>
		</label>

		<button
			type="submit"
			class="w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
			style="background:var(--primary)"
		>
			{mode === 'signup' ? 'Create account' : 'Sign in'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm" style="color:var(--accent)">
		{#if mode === 'login'}
			No account?
			<button
				type="button"
				class="font-semibold underline underline-offset-2"
				style="color:var(--primary)"
				onclick={() => (modeOverride = 'signup')}
			>
				Sign up
			</button>
		{:else}
			Already have an account?
			<button
				type="button"
				class="font-semibold underline underline-offset-2"
				style="color:var(--primary)"
				onclick={() => (modeOverride = 'login')}
			>
				Sign in
			</button>
		{/if}
	</p>
</section>
