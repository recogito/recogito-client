import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect, request, url }) => {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') || '/';

  if (token_hash && type) {
    const supabase = createServerClient(
      import.meta.env.SUPABASE_SERVERCLIENT_URL ||
        import.meta.env.PUBLIC_SUPABASE,
      import.meta.env.PUBLIC_SUPABASE_API_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '');
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) return redirect(next);
  }

  const path = url.protocol + '//' + url.host;
  const error = await fetch(`${path}/500`);
  return new Response(error.body, { headers: error.headers, status: 500 });
};
