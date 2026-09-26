<script>
	let { form, data } = $props();

	let modeOverride = $state(/** @type {'login' | 'signup' | null} */ (null));
	let mode = $derived(modeOverride ?? form?.mode ?? 'login');
</script>

<svelte:head>
	<title>{mode === 'signup' ? 'Create account' : 'Sign in'} · Dining Hall</title>
</svelte:head>

<section class="mx-auto max-w-md">
	<h1 class="text-2xl font-semibold tracking-tight">
		{mode === 'signup' ? 'Create account' : 'Sign in'}
	</h1>
	<p class="mt-2 text-sm text-stone-600">
		Georgia Tech emails only (<span class="font-medium">@gatech.edu</span>).
	</p>

	{#if data.registered}
		<p
			class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
			role="status"
		>
			Check your inbox to confirm your email, then sign in.
		</p>
	{/if}

	{#if form?.error}
		<p
			class="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
			role="alert"
		>
			{form.error}
		</p>
	{/if}

	<form method="POST" action="?/{mode}" class="mt-6 space-y-4">
		<label class="block text-sm">
			<span class="mb-1 block font-medium text-stone-700">Email</span>
			<input
				type="email"
				name="email"
				value={form?.email ?? ''}
				required
				autocomplete="email"
				placeholder="gburdell3@gatech.edu"
				class="block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
			/>
		</label>

		<label class="block text-sm">
			<span class="mb-1 block font-medium text-stone-700">Password</span>
			<input
				type="password"
				name="password"
				required
				minlength="6"
				autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
				class="block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
			/>
		</label>

		<button
			type="submit"
			class="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
		>
			{mode === 'signup' ? 'Create account' : 'Sign in'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-stone-600">
		{#if mode === 'login'}
			No account?
			<button
				type="button"
				class="font-medium text-stone-900 underline underline-offset-2"
				onclick={() => (modeOverride = 'signup')}
			>
				Sign up
			</button>
		{:else}
			Already have an account?
			<button
				type="button"
				class="font-medium text-stone-900 underline underline-offset-2"
				onclick={() => (modeOverride = 'login')}
			>
				Sign in
			</button>
		{/if}
	</p>
</section>
