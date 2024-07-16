import type { SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import {
  createSupabaseClient as _createSupabaseClient,
  type SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';

const supabaseServerUrl = 
  import.meta.env.SUPABASE_SERVERCLIENT_URL ||
  import.meta.env.PUBLIC_SUPABASE;

const supabaseAPIKey =
  import.meta.env.PUBLIC_SUPABASE_API_KEY;

export async function createSupabaseServerClient(
  request: Request,
  cookies: AstroCookies,
  {
    supabaseUrl,
    supabaseKey,
    options
  }: {
    supabaseUrl: string;
    supabaseKey: string;
    options?: SupabaseClientOptionsWithoutAuth;
  } = {
    supabaseUrl: supabaseServerUrl,
    supabaseKey: supabaseAPIKey
  }
) {
  const client = _createSupabaseClient(
    supabaseUrl,
    supabaseKey,
    {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers
        }
      },
      auth: {
        storage: {
          // getRequestHeader: (key: string) => request.headers.get(key) as (string | undefined),

          getItem: (name: string) => {
            return cookies.get(name)?.value as string;
          },

          setItem: (name: string, value: string) => {
            cookies.set(name, value);
          },

          removeItem: (name: string) => {
            cookies.delete(name)
          }
        }
      }
    }
  );

  await refreshSession(client, cookies);

  return client;
}

const refreshSession = async (supabase: SupabaseClient, cookies: AstroCookies) => {  
  console.log('checking session');

  const { data: { session }} = await supabase.auth.getSession();
  if (session) {
    console.log('session is valid')
    return true;
  }

  console.log('refreshing...')
  const refreshToken = cookies.get('sb-refresh-token');
  const accessToken = cookies.get('sb-access-token');

  if (refreshToken?.value && accessToken?.value) {
    return await supabase.auth.setSession({ 
      refresh_token: refreshToken.value, 
      access_token: accessToken.value 
    }).then(({ data, error }) => {
      console.log('error?', error);
      console.log('user', data.user);
      console.log('session', data.session);
      return !error
    }).catch(error => {
      console.log('Error: could not set auth session', error);
    })
  } else {
    if (!refreshToken?.value)
      console.log('could not find refresh token');

    if (!accessToken?.value)
      console.log('could not find access token');
  }
}