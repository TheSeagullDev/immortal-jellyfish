import { fail } from '@sveltejs/kit';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const KINDS = new Set(['classification', 'post', 'user']);

/**
 * @param {string} name
 */
function localEnv(name) {
	if (process.env[name]) return process.env[name];
	try {
		const text = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
		for (const line of text.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed.startsWith(`${name}=`)) continue;
			return trimmed.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
		}
	} catch {
		// no local env file
	}
	return '';
}

/**
 * Send a demo report to the admin inbox via Resend.
 * Reuse this from any form action (composer, posts, users).
 *
 * @param {{
 *   kind: string,
 *   reporterEmail?: string,
 *   reporterId?: string,
 *   summary: string,
 *   extra?: Record<string, string>
 * }} payload
 */
export async function sendAdminReport(payload) {
	const apiKey = localEnv('RESEND_API_KEY');
	const to = localEnv('REPORT_EMAIL');
	const from = localEnv('RESEND_FROM') || 'MealWise <onboarding@resend.dev>';

	if (!apiKey || !to) {
		console.warn('[report] RESEND_API_KEY or REPORT_EMAIL missing — skipping');
		return { sent: false, skipped: true };
	}

	const lines = [
		`Kind: ${payload.kind}`,
		`Reporter: ${payload.reporterEmail || 'unknown'} (${payload.reporterId || 'no id'})`,
		`Summary: ${payload.summary}`,
		...Object.entries(payload.extra ?? {})
			.filter(([, value]) => value)
			.map(([key, value]) => `${key}: ${value}`)
	];

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'content-type': 'application/json'
		},
		signal: AbortSignal.timeout(15_000),
		body: JSON.stringify({
			from,
			to: [to],
			subject: `[MealWise] ${payload.kind} report`,
			text: lines.join('\n')
		})
	});

	if (!res.ok) {
		const body = await res.text();
		console.error('[report] Resend error', res.status, body);
		return { sent: false, skipped: false, error: `Resend ${res.status}` };
	}

	console.log('[report] emailed', { kind: payload.kind, to });
	return { sent: true, skipped: false };
}

/**
 * Shared SvelteKit form action for "this is incorrect" / report buttons.
 * Wire as `report: handleReportAction` on any page that owns a form.
 *
 * @param {{ request: Request, locals: { safeGetSession: Function } }} event
 */
export async function handleReportAction({ request, locals }) {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return fail(401, { error: 'Sign in to report.' });
	}

	const form = await request.formData();
	const kind = String(form.get('kind') ?? '').trim();
	if (!KINDS.has(kind)) {
		return fail(400, { error: 'Unknown report type.' });
	}

	const extra = {};
	for (const [key, value] of form.entries()) {
		if (key === 'kind' || key === 'summary') continue;
		if (typeof value === 'string' && value) extra[key] = value.slice(0, 500);
	}

	const result = await sendAdminReport({
		kind,
		reporterEmail: user.email ?? '',
		reporterId: user.id,
		summary: String(form.get('summary') ?? '').trim() || `${kind} flagged as incorrect`,
		extra
	});

	if (result.skipped) {
		return fail(503, { error: 'Reporting is not configured yet.' });
	}
	if (!result.sent) {
		return fail(502, { error: 'Could not send the report. Try again.' });
	}

	return { reported: true };
}
