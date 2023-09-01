import type { APIRoute } from 'astro';

const IIIF_URL = import.meta.env.IIIF_URL;
const IIIF_PROJECT_ID = import.meta.env.IIIF_PROJECT_ID;
const IIIF_KEY = import.meta.env.IIIF_KEY;

export const post: APIRoute = async ({ request }) => {
  // TODO test if the user is authorized
  
  // Incoming FormData
  const data = await request.formData();
  const name = data.get('name') as string;
  const file = data.get('file') as File;

  // Forward as outgoing FormData
  const formData  = new FormData();
  formData.append('resource[name]', name);
  formData.append('resource[project_id]', IIIF_PROJECT_ID);
  formData.append('resource[content]', file);

  return fetch(IIIF_URL, {
    headers: {
      'X-API-KEY': IIIF_KEY
    },
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(result => new Response(
    JSON.stringify(result),
    { status: 200 }
  ));
}