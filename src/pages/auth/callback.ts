import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { type APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies, redirect, url }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // by default, redirect to projects dashboard after auth
  const next = requestUrl.searchParams.get('next') || '/en/projects';

  if (code) {
    const supabase = createServerClient(
      import.meta.env.SUPABASE_SERVERCLIENT_URL ||
        import.meta.env.PUBLIC_SUPABASE,
      import.meta.env.PUBLIC_SUPABASE_API_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '').map(
              ({ name, value }) => ({
                name,
                value: value ?? '',
              })
            );
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(next);
    }
  }

  const path = url.protocol + '//' + url.host;
  const error = await fetch(`${path}/500`);
  return new Response(error.body, { headers: error.headers, status: 500 });
};
