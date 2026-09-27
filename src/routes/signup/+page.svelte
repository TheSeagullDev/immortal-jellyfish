<script>
	let { form } = $props();
</script>

<svelte:head>
	<title>Create account · MealWise</title>
</svelte:head>

<section class="px-5 py-8 sm:px-8">
	<div class="mx-auto max-w-md">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--text)">Create account</h1>
		<p class="mt-2 text-sm" style="color:var(--text-muted)">
			Georgia Tech emails only (<span class="font-medium">@gatech.edu</span>).
		</p>

		{#if form?.error}
			<p
				class="mt-4 rounded-md px-3 py-2 text-sm"
				style="background:color-mix(in srgb,#b42318 10%,var(--background));color:#8a1f16"
				role="alert"
			>
				{form.error}
			</p>
		{/if}

		<form method="POST" class="mt-6 space-y-4">
			<label class="block text-sm">
				<span class="mb-1 block font-medium" style="color:var(--text)">Name</span>
				<input
					type="text"
					name="name"
					value={form?.name ?? ''}
					required
					autocomplete="name"
					placeholder="George P. Burdell"
					class="block w-full rounded-md"
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
					class="block w-full rounded-md"
				/>
			</label>

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
					autocomplete="new-password"
					placeholder="********"
					class="block w-full rounded-md"
				/>
			</label>

			<label class="block text-sm">
				<span class="mb-1 block font-medium" style="color:var(--text)">Confirm password</span>
				<input
					type="password"
					name="password_confirm"
					required
					minlength="6"
					autocomplete="new-password"
					placeholder="********"
					class="block w-full rounded-md"
				/>
			</label>

			<button
				type="submit"
				class="w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
				style="background:var(--primary);color:var(--on-primary)"
			>
				Create account
			</button>
		</form>

		<p class="mt-6 text-center text-sm" style="color:var(--text-muted)">
			Already have an account?
			<a href="/login" class="font-semibold" style="color:var(--primary)">Sign in</a>
		</p>
	</div>
</section>
