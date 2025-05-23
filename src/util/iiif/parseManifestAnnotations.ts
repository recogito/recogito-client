import { v4 as uuidv4 } from 'uuid';
import Quill from 'quill';
import type { Manifest } from '@allmaps/iiif-parser';
import { parseW3CImageAnnotation, type AnnotationBody, type ImageAnnotation } from '@annotorious/annotorious';
import type { EmbeddedLayer } from 'src/Types';
import { getResourceLabel } from './getResourceLabel';

const crosswalkBodies = (bodies: AnnotationBody[]): AnnotationBody[] => {
  const keepPurposes = new Set(['commenting', 'replying', 'describing']);

  const crosswalkPurpose = (purpose?: string) =>
    (!purpose || purpose === 'describing') ? 'commenting' : purpose;

  const htmlToQuill = (html: string) => {
    const quill = new Quill(document.createElement('div'));
    return quill.clipboard.convert({ html });
  }

  const toKeep = bodies.filter(b => typeof b.value === 'string' && (!b.purpose || keepPurposes.has(b.purpose)));
  return toKeep.map(b => ({
    id: b.id || uuidv4(),
    purpose: crosswalkPurpose(b.purpose), 
    created: b.created,
    value: (b.value && (b as any).format === 'text/html') ? JSON.stringify(htmlToQuill(b.value)) : b.value
  } as AnnotationBody));
}

export const parseManifestAnnotations = (manifest: Manifest) => {
  const layer: EmbeddedLayer = {
    id: manifest.uri,
    name: getResourceLabel(manifest.label),
    is_active: false // Read-only
  }

  const annotations = manifest.canvases.reduce<Record<string, ImageAnnotation[]>>((agg, canvas) => {
    // Aggregate annotations from all annotation pages on this canvas
    const onThisCanvas = (canvas.annotations || []).reduce<ImageAnnotation[]>((all, page) => {
      const items = ('items' in page ? page.items as any[] : []) || [];

      const crosswalked = items.map(item => ({
          layer_id: manifest.uri,
          ...parseW3CImageAnnotation(item).parsed
      })).map(a => ({
        ...a,
        bodies: crosswalkBodies(a.bodies || [])
      } as ImageAnnotation));

      return [...all, ...crosswalked];
    }, []);

    if (onThisCanvas.length > 0) {
      agg[canvas.uri] = onThisCanvas;
      return agg;
    } else {
      return agg;
    }
  }, {});

  return Object.keys(annotations).length > 0 ? { annotations, layer } : undefined;

}