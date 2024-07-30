import type { AstroCookies } from 'astro';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseServerUrl = 
  import.meta.env.SUPABASE_SERVERCLIENT_URL ||
  import.meta.env.PUBLIC_SUPABASE;

const supabaseAPIKey =
  import.meta.env.PUBLIC_SUPABASE_API_KEY;

export const createSupabaseServerClient = (
  cookies: AstroCookies
) => {
  const supabase = createServerClient(
    supabaseServerUrl,
    supabaseAPIKey,
    {
      cookies: {
        get(key: string) {
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          cookies.set(key, value, options);
        },
        remove(key: string, options) {
          cookies.delete(key, options);
        }
      }
    }
  );

  return refreshSession(supabase, cookies).then(() => supabase);
}

const refreshSession = async (supabase: SupabaseClient, cookies: AstroCookies) => {  
  const { data: { session }} = await supabase.auth.getSession();
  if (session) return true;

  const refreshToken = cookies.get('sb-refresh-token');
  const accessToken = cookies.get('sb-access-token');

  if (refreshToken?.value && accessToken?.value) {
    return await supabase.auth.setSession({ 
      refresh_token: refreshToken.value, 
      access_token: accessToken.value 
    }).then(({ data, error }) => {
      if (error)
        console.error('Error refreshing session!', error);
        
      return !error
    })
  }
}
