import { v4 as uuidv4 } from 'uuid';
import type { Manifest } from '@allmaps/iiif-parser';
import { parseW3CImageAnnotation, type AnnotationBody } from '@annotorious/annotorious';
import type { SupabaseAnnotation } from '@recogito/studio-sdk';

const crosswalkBodies = (bodies: AnnotationBody[]): AnnotationBody[] => {
  const keepPurposes = new Set(['commenting', 'replying', 'describing']);

  const crosswalkPurpose = (purpose?: string) =>
    (!purpose || purpose === 'describing') ? 'commenting' : purpose;

  const toKeep = bodies.filter(b => typeof b.value === 'string' && (!b.purpose || keepPurposes.has(b.purpose)));
  return toKeep.map(b => ({
    id: b.id || uuidv4(),
    purpose: crosswalkPurpose(b.purpose), 
    created: b.created,
    value: b.value
  } as AnnotationBody));
}

export const parseManifestAnnotations = (manifest: Manifest) => {

  const annotations = manifest.canvases.reduce<Record<string, any[]>>((agg, canvas) => {
    // Aggregate annotations from all annotation pages on this canvas
    const onThisCanvas = (canvas.annotations || []).reduce<any[]>((all, page) => {
      const items = ('items' in page ? page.items as any[] : []) || [];

      // TODO crosswalk items to SupabaseAnnotations
      const crosswalked = items.map(item => ({
          layer_id: 'manifest',
          ...parseW3CImageAnnotation(item).parsed
      })).map(a => ({
        ...a,
        bodies: crosswalkBodies(a.bodies || [])
      } as SupabaseAnnotation));

      return [...all, ...crosswalked];
    }, []);

    if (onThisCanvas.length > 0) {
      agg[canvas.uri] = onThisCanvas;
      return agg;
    } else {
      return agg;
    }
  }, {});

  /*
  export interface EmbeddedLayer {
    id: string;
  
    name?: string;
  
    is_active?: boolean;
  }
  */

  return annotations;

}