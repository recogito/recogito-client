import type { SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import {
  CookieOptions,
  createBrowserSupabaseClient as _createBrowserSupabaseClient,
  createServerSupabaseClient as _createServerSupabaseClient,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';

const supabaseServerUrl = 
  import.meta.env.SUPABASE_SERVERCLIENT_URL ||
  import.meta.env.PUBLIC_SUPABASE;

export async function createSupabaseServerClient(
  request: Request,
  cookies: AstroCookies,
  {
    supabaseUrl,
    supabaseKey,
    options,
    cookieOptions
  }: {
    supabaseUrl: string;
    supabaseKey: string;
    options?: SupabaseClientOptionsWithoutAuth;
    cookieOptions?: CookieOptions;
  } = {
    supabaseUrl: supabaseServerUrl,
    supabaseKey: import.meta.env.PUBLIC_SUPABASE_API_KEY,
    //@ts-ignore
    cookieOptions: {
      name: 'sb-auth-token'
    }
  }
) {

  const client = _createServerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    getRequestHeader: (key) => request.headers.get(key) as (string | undefined),

    getCookie(name) {
      return cookies.get(name).value;
    },

    setCookie(name, value, options) {
      cookies.set(name, value, options);
    },

    options: {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers
        }
      }
    },
    cookieOptions
  });

  const success = await refreshSession(client, cookies);
  return success ? client : null;
}

const refreshSession = async (supabase: SupabaseClient, cookies: AstroCookies) => {  
  const { data: { session }} = await supabase.auth.getSession();
  if (session)
    return true;

  const refreshToken = cookies.get('sb-refresh-token');
  const accessToken = cookies.get('sb-access-token');

  if (refreshToken.value && accessToken.value) {
    return await supabase.auth.setSession({ 
      refresh_token: refreshToken.value, 
      access_token: accessToken.value 
    }).then(({ error }) => !error)
  }
}