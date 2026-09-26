<script>
	let { data } = $props();

	// Images per column, duplicated in the template for seamless looping.
	// Heights vary to create a natural masonry feel.
	const cols = [
		[
			{ seed: 'mw-a1', h: 320 },
			{ seed: 'mw-a2', h: 260 },
			{ seed: 'mw-a3', h: 380 },
			{ seed: 'mw-a4', h: 300 }
		],
		[
			{ seed: 'mw-b1', h: 280 },
			{ seed: 'mw-b2', h: 360 },
			{ seed: 'mw-b3', h: 240 },
			{ seed: 'mw-b4', h: 340 }
		],
		[
			{ seed: 'mw-c1', h: 350 },
			{ seed: 'mw-c2', h: 270 },
			{ seed: 'mw-c3', h: 310 },
			{ seed: 'mw-c4', h: 390 }
		],
		[
			{ seed: 'mw-d1', h: 290 },
			{ seed: 'mw-d2', h: 370 },
			{ seed: 'mw-d3', h: 260 },
			{ seed: 'mw-d4', h: 330 }
		]
	];

	const speeds = [28, 22, 32, 25];
	const directions = ['up', 'down', 'up', 'down'];
</script>

<svelte:head>
	<title>MealWise</title>
</svelte:head>

{#if data.user}
	<div class="mx-auto max-w-3xl px-4 py-8">
		<h1 class="text-2xl font-bold tracking-tight" style="color:var(--primary)">
			Hey{data.user.user_metadata?.display_name
				? `, ${data.user.user_metadata.display_name}`
				: ''}
		</h1>
		<p class="mt-2 text-sm" style="color:var(--accent)">
			{#if data.user.user_metadata?.username}
				<span class="font-medium" style="color:var(--text)">@{data.user.user_metadata.username}</span>
				·
			{/if}
			{data.user.email}
		</p>
	</div>
{:else}
	<div class="relative flex min-h-[calc(100dvh-53px)] items-center justify-center overflow-hidden">

		<!-- Scrolling image columns -->
		<div class="absolute inset-0 flex gap-3 px-3" aria-hidden="true">
			{#each cols as col, i}
				<div class="flex flex-1 flex-col overflow-hidden">
					<div
						class="flex flex-col gap-3"
						style="animation: scroll-{directions[i]} {speeds[i]}s linear infinite;"
					>
						{#each [...col, ...col] as img}
							<img
								src="https://picsum.photos/seed/{img.seed}/400/{img.h}"
								alt=""
								width="400"
								height={img.h}
								class="w-full rounded-lg object-cover"
								style="height:{img.h}px"
								loading="lazy"
							/>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Gradient overlay: fades edges + darkens center so text reads cleanly -->
		<div
			class="absolute inset-0 pointer-events-none"
			style="
				background:
					linear-gradient(to bottom, var(--background) 0%, transparent 18%, transparent 82%, var(--background) 100%),
					linear-gradient(to right,  var(--background) 0%, transparent 18%, transparent 82%, var(--background) 100%),
					radial-gradient(ellipse 55% 60% at 50% 50%, color-mix(in srgb, var(--background) 72%, transparent) 0%, transparent 100%);
			"
		></div>

		<!-- Hero -->
		<div class="relative z-10 px-6 py-16 text-center">
			<span
				class="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
				style="background:var(--accent)"
			>
				GT Dining · Ranked by you
			</span>

			<h1 class="mt-5 text-5xl font-extrabold tracking-tight sm:text-6xl" style="color:var(--primary)">
				Meal<span style="color:var(--accent)">Wise</span>
			</h1>

			<p class="mx-auto mt-4 max-w-md text-lg leading-relaxed" style="color:var(--text);opacity:0.7">
				The dining hall social feed built for Georgia Tech.
				Post your plate, rate your food, find what's worth the walk.
			</p>

			<div class="mt-8 flex flex-wrap justify-center gap-3">
				<a
					href="/login"
					class="rounded-md px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
					style="background:var(--accent)"
				>
					Create account
				</a>
				<a
					href="/login"
					class="rounded-md border px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-75"
					style="border-color:var(--primary);color:var(--primary);background:color-mix(in srgb,var(--background) 70%,transparent)"
				>
					Sign in
				</a>
			</div>

			<p class="mt-10 text-xs opacity-40" style="color:var(--text)">
				For Georgia Tech students only · @gatech.edu required
			</p>
		</div>
	</div>
{/if}

<style>
	@keyframes scroll-up {
		from { transform: translateY(0); }
		to   { transform: translateY(-50%); }
	}
	@keyframes scroll-down {
		from { transform: translateY(-50%); }
		to   { transform: translateY(0); }
	}
</style>
