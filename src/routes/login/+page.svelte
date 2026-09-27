<script>
	let { form, data } = $props();

	let resetOpen = $state(false);

	$effect(() => {
		if (form?.resetEmail || data.magicSent) resetOpen = true;
	});
</script>

<svelte:head>
	<title>Sign in · MealWise</title>
</svelte:head>

<section class="px-5 py-8 sm:px-8">
	<div class="mx-auto max-w-md">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--text)">Sign in</h1>
		<p class="mt-2 text-sm" style="color:var(--text-muted)">
			Georgia Tech emails only (<span class="font-medium">@gatech.edu</span>).
		</p>

		{#if data.registered}
			<p
				class="mt-4 rounded-md px-3 py-2 text-sm"
				style="background:var(--surface);color:var(--text)"
				role="status"
			>
				Check your inbox to confirm your email, then sign in.
			</p>
		{/if}

		{#if data.magicSent}
			<p
				class="mt-4 rounded-md px-3 py-2 text-sm"
				style="background:var(--surface);color:var(--text)"
				role="status"
			>
				If an account exists for that email, we sent a link.
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

		{#if resetOpen}
			<form method="POST" action="?/magic" class="mt-6 space-y-4">
				<p class="text-sm font-semibold" style="color:var(--text)">Forgot password</p>
				<label class="block text-sm">
					<span class="mb-1 block font-medium" style="color:var(--text)">Email</span>
					<input
						type="email"
						name="email"
						value={form?.resetEmail ?? ''}
						required
						autocomplete="email"
						placeholder="gburdell3@gatech.edu"
						class="block w-full rounded-md"
					/>
				</label>
				<button
					type="submit"
					class="w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
					style="background:var(--primary);color:var(--on-primary)"
				>
					Send
				</button>
				<button
					type="button"
					class="w-full text-center text-sm font-semibold"
					style="background:transparent;border:0;color:var(--primary);cursor:pointer"
					onclick={() => (resetOpen = false)}
				>
					Back to sign in
				</button>
			</form>
		{:else}
			<form method="POST" action="?/login" class="mt-6 space-y-4">
				<label class="block text-sm">
					<span class="mb-1 block font-medium" style="color:var(--text)">Email</span>
					<input
						type="email"
						name="email"
						value={form?.email ?? ''}
						required
						autocomplete="email"
						placeholder="gburdell3@gatech.edu"
						class="block w-full rounded-md"
					/>
				</label>

				<label class="block text-sm">
					<span class="mb-1 block font-medium" style="color:var(--text)">Password</span>
					<input
						type="password"
						name="password"
						required
						minlength="6"
						autocomplete="current-password"
						placeholder="********"
						class="block w-full rounded-md"
					/>
				</label>

				<button
					type="submit"
					class="w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
					style="background:var(--primary);color:var(--on-primary)"
				>
					Sign in
				</button>
				<button
					type="button"
					class="w-full text-center text-sm font-semibold"
					style="background:transparent;border:0;color:var(--primary);cursor:pointer"
					onclick={() => (resetOpen = true)}
				>
					Forgot password
				</button>
			</form>
		{/if}

		<p class="mt-6 text-center text-sm" style="color:var(--text-muted)">
			No account?
			<a href="/signup" class="font-semibold" style="color:var(--primary)">Sign up</a>
		</p>
	</div>
</section>
