
import { getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getDocument, getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';

const crosswalkTarget = (target: any) => {

  const value = JSON.parse(target.value);

  if (value.type === 'RECTANGLE') {
    const { x, y, w, h } = value.geometry;
  
    return {
      type: 'FragmentSelector',
      conformsTo: 'http://www.w3.org/TR/media-frags/',
      value: `xywh=pixel:${x},${y},${w},${h}`
    };
  } else if (value.type === 'POLYGON') {
    const { points } = value.geometry;

    return  {
      type: 'SvgSelector',
      // @ts-ignore
      value: `<polygon points="${points.map(xy => xy.join(',')).join(' ')}" />`
    };
  } else if (value.startSelector?.type === 'XPathSelector') {
    return {
      startSelector: value.startSelector,
      endSelector: value.endSelector
    }
  } else {
    return value;
  }
}

export const get: APIRoute = async ({ params, request, cookies, url }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(request, cookies);
  if (!supabase)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const profile = await getMyProfile(supabase);
  if (profile.error || !profile.data)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const projectId = params.project!;

  const policies = await getProjectPolicies(supabase, projectId);
  if (policies.error)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  // At the project level, only admins can export annotations
  const isAdmin = policies.data.get('projects').has('UPDATE') || profile.data.isOrgAdmin;
  if (!isAdmin)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const documentId = url.searchParams.get('document');
  if (!documentId)
    return new Response(
      JSON.stringify({ error: 'Missing query arg: document' }),
      { status: 400 });

  const document = await getDocument(supabase, documentId);
  if (document.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  // At the project level, all layers in the project will be exported
  const layers = await getAllLayersInProject(supabase, projectId);
  if (layers.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const layerIds = layers.data.map(l => l.id);

  // Download TEI from DB
  const content = await supabase.storage.from(document.data.bucket_id!).download(documentId);
  if (content.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const xml = await content.data.text();

  const filename = document.data.name.endsWith('.xml') ?
    document.data.name : `${document.data.name}.tei.xml`

  /*
  // TODO inline annotations as TEI standoff
  const annotations = await getAnnotations(supabase, layerIds);
  if (annotations.error) { 
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 
  }

  const w3c = annotations.data.map(a => ({
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    id: a.id,
    type: 'Annotation',
    body: a.bodies.map(b => ({
      purpose: b.purpose,
      value: b.value,
      // @ts-ignore
      creator: b.created_by.id,
      created: b.created_at
    })),
    target: a.targets.map(crosswalkTarget)
  }));
  */

  return new Response(    
    xml,
    { 
      headers: { 
        'Content-Type': 'text/xml',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );

};