import { getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';

const IIIF_KEY = import.meta.env.IIIF_KEY || import.meta.env.RECOGITO_TIGER;
const IIIF_URL = import.meta.env.IIIF_URL;
const IIIF_PROJECT_ID = import.meta.env.IIIF_PROJECT_ID;

export const POST: APIRoute = async ({ cookies, request }) => {

  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(request, cookies);

  const me = await getMyProfile(supabase);
  if (me.error || !me.data)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });

  // Incoming FormData
  const data = await request.formData();
  const name = data.get('name') as string;
  const file = data.get('file') as File;

  if (!(name && file))
    return new Response(JSON.stringify({ error: 'Bad request' }), {
      status: 400,
    });

  // Forward as outgoing FormData
  const formData = new FormData();
  formData.append('resource[name]', name);
  formData.append('resource[project_id]', IIIF_PROJECT_ID);
  formData.append('resource[content]', file);

  // console.log('Calling IIIF fetch');
  return fetch(IIIF_URL, {
    headers: {
      'X-API-KEY': IIIF_KEY,
    },
    method: 'POST',
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      return new Response(JSON.stringify(result), { status: 200 });
    });
};
