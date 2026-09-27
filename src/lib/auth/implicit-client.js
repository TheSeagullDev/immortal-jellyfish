import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * PKCE email links only work in the same browser that requested them (code verifier
 * cookie). Mail apps open a different context, so ConfirmationURL fails to exchange.
 * Implicit links put tokens in the hash and work from any client.
 */
export function createImplicitAuthClient() {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		auth: {
			flowType: 'implicit',
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false
		}
	});
}
