<script>
	import { enhance } from '$app/forms';

	let {
		kind = 'classification',
		summary = '',
		action = '/?/report',
		label = 'This is incorrect',
		extra = {}
	} = $props();

	let status = $state(/** @type {'' | 'sent' | 'error'} */ (''));
	let message = $state('');
</script>

{#if status === 'sent'}
	<p class="mt-2 text-xs" style="color:var(--text-muted)">Thanks — we emailed the team.</p>
{:else}
	<form
		method="POST"
		{action}
		class="mt-2"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success' && result.data?.reported) {
					status = 'sent';
					message = '';
					return;
				}
				status = 'error';
				message =
					(result.type === 'failure' && result.data && 'error' in result.data
						? String(result.data.error)
						: '') || 'Could not send the report.';
			};
		}}
	>
		<input type="hidden" name="kind" value={kind} />
		<input type="hidden" name="summary" value={summary} />
		{#each Object.entries(extra) as [key, value]}
			<input type="hidden" name={key} value={value} />
		{/each}
		<button
			type="submit"
			class="text-xs font-semibold underline-offset-2 hover:underline"
			style="color:var(--primary);background:transparent;border:0;padding:0;cursor:pointer"
		>
			{label}
		</button>
		{#if status === 'error' && message}
			<p class="mt-1 text-xs" style="color:#8a1f16">{message}</p>
		{/if}
	</form>
{/if}
