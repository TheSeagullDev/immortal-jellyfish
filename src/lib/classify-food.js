import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MODEL = 'gemini-3.8-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function geminiKey() {
	if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
	try {
		const text = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
		for (const line of text.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed.startsWith('GEMINI_API_KEY=')) continue;
			return trimmed.slice('GEMINI_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
		}
	} catch {
		// no local env file (e.g. Vercel)
	}
	return '';
}

/**
 * @param {{
 *   bytes: Uint8Array,
 *   mimeType: string,
 *   menu: { id: number, name: string, station?: string }[]
 * }} input
 * @returns {Promise<{
 *   skipped: boolean,
 *   isFood: boolean,
 *   rejectReason: string,
 *   matches: { id: number, name: string }[]
 * }>}
 */
export async function classifyPlate({ bytes, mimeType, menu }) {
	const apiKey = geminiKey();
	if (!apiKey) {
		console.warn('[classify] GEMINI_API_KEY missing — skipping');
		return { skipped: true, isFood: true, rejectReason: '', matches: [] };
	}
	console.log('[classify] Gemini key loaded');

	const allowed = new Map(menu.map((item) => [item.id, item.name]));
	const menuLines = menu
		.slice(0, 160)
		.map((item) => `${item.id}\t${item.name}${item.station ? `\t(${item.station})` : ''}`)
		.join('\n');

	const prompt = `You moderate a Georgia Tech dining-hall photo.

Decide if the image is primarily a meal / plate / food / drink from a dining hall.
Reject (is_food=false) for: selfies, memes, screenshots, people, rooms with no food, spam, empty tables, IDs, or sexual/violent content.
reject_reason is an internal short label for logs (e.g. selfie, screenshot). Do not write it as something to show a user.

If it is food, pick 0–6 items from TODAY'S MENU that are actually visible. Use only ids from the list. Mixed trays are normal (protein + sides + fruit). If you cannot match a menu item, return an empty matches array — still is_food=true.

TODAY'S MENU (id, name, station):
${menuLines || '(empty menu today)'}

Return JSON only.`;

	const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-goog-api-key': apiKey
		},
		signal: AbortSignal.timeout(25_000),
		body: JSON.stringify({
			contents: [
				{
					parts: [
						{ text: prompt },
						{
							inline_data: {
								mime_type: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
								data: Buffer.from(bytes).toString('base64')
							}
						}
					]
				}
			],
			generationConfig: {
				temperature: 0.1,
				responseMimeType: 'application/json',
				responseSchema: {
					type: 'OBJECT',
					properties: {
						is_food: { type: 'BOOLEAN' },
						reject_reason: { type: 'STRING' },
						matches: {
							type: 'ARRAY',
							items: {
								type: 'OBJECT',
								properties: {
									id: { type: 'INTEGER' },
									name: { type: 'STRING' }
								},
								required: ['id', 'name']
							}
						}
					},
					required: ['is_food', 'matches']
				}
			}
		})
	});

	if (!res.ok) {
		const body = await res.text();
		console.error('[classify] Gemini HTTP error', res.status, body);
		throw new Error(`Gemini ${res.status}: ${body.slice(0, 240)}`);
	}

	const payload = await res.json();
	const text = payload?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
	console.log('[classify] Gemini raw text', text);
	console.log('[classify] Gemini finishReason', payload?.candidates?.[0]?.finishReason);
	let parsed = { is_food: true, reject_reason: '', matches: [] };
	try {
		parsed = JSON.parse(text);
	} catch {
		console.error('[classify] non-JSON payload', payload);
		throw new Error('Gemini returned non-JSON.');
	}

	const matches = (Array.isArray(parsed.matches) ? parsed.matches : [])
		.map((row) => ({
			id: Number(row?.id),
			name: allowed.get(Number(row?.id)) ?? String(row?.name ?? '').trim()
		}))
		.filter((row) => Number.isFinite(row.id) && allowed.has(row.id) && row.name)
		.slice(0, 6);

	const result = {
		skipped: false,
		isFood: parsed.is_food !== false,
		rejectReason: String(parsed.reject_reason ?? '').trim(),
		matches
	};
	console.log('[classify] parsed', parsed);
	console.log('[classify] result', result);
	return result;
}
