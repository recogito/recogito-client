import { serializeW3CImageAnnotation } from '@annotorious/annotorious';
import type { AnnotationBody, ImageAnnotation, W3CAnnotationBody } from '@annotorious/annotorious';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { type TextAnnotation, serializeW3CTextAnnotation } from '@recogito/text-annotator';
import { type TEIAnnotation, serializeW3CTEIAnnotation } from '@recogito/text-annotator-tei';
import type { PDFAnnotation } from '@recogito/pdf-annotator';
import { serializeW3CPDFAnnotation } from '@recogito/pdf-annotator/w3c';
import { quillToHTML } from '@util/export';

const isPlainTextAnnotation = (a: SupabaseAnnotation) => {
  if (!Array.isArray(a.target.selector)) return false;

  return a.target.selector.every(s => 
    typeof s.start === 'number' && typeof s.end === 'number');
}

const isTEIAnnotation = (a: SupabaseAnnotation) => {
  if (!isPlainTextAnnotation(a)) return false;

  return (a.target.selector as any[]).every(s => 
    s.startSelector?.type === 'XPathSelector' && s.endSelector?.type === 'XPathSelector');
}

const isPDFAnnotation = (a: SupabaseAnnotation) => {
  if (!Array.isArray(a.target.selector)) return false;
  return a.target.selector.every(s => 
    typeof s.start === 'number' && typeof s.end === 'number' && typeof s.pageNumber === 'number');
}

const isImageAnnotation = (a: SupabaseAnnotation) =>
  (a.target.selector as any)?.type === 'RECTANGLE' ||
  (a.target.selector as any)?.type === 'POLYGON';

const crosswalkAnnotationBodies = (bodies: AnnotationBody[]) => {
  const crosswalkOne= (body: AnnotationBody) => {
    const { created, creator, purpose } = body;

    const isQuillBody = (!purpose || purpose === 'commenting' || purpose === 'replying') && body.value?.startsWith('{');
  
    const isJSON = (() => {
      if (typeof body.value !== 'string') return false;
      try {
        JSON.parse(body.value);
      } catch (e) {
        return false;
      }
      return true;
    })();

    const value = isQuillBody 
      ? quillToHTML(body.value!) 
      : isJSON ? JSON.parse(body.value!) : body.value;

    const crosswalked: any = {
      created,
      creator: creator?.name ? { id: creator.id, name: creator.name } : undefined,
      purpose,
      value
    }

    if (body.type) {
      crosswalked.type = body.type;
    } else if (!isJSON) {
      if (purpose === 'commenting' || purpose === 'replying' || !purpose)
        crosswalked.type = 'TextualBody';
    }

    if (isJSON)
      crosswalked.format = 'application/json';

    if (isQuillBody)
      crosswalked.format = 'text/html';

    return crosswalked as W3CAnnotationBody;
  }

  return bodies.map(crosswalkOne);
}

export const annotationsToW3C = (annotations: SupabaseAnnotation[], projectId: string) => {
  return annotations.map(annotation => {
    if (isImageAnnotation(annotation)) {
      return serializeW3CImageAnnotation(annotation as ImageAnnotation, projectId);
    } else if (isPDFAnnotation(annotation)) {
      return serializeW3CPDFAnnotation(annotation as PDFAnnotation, projectId);
    } else if (isTEIAnnotation(annotation)) {
      return serializeW3CTEIAnnotation(annotation as TEIAnnotation, projectId);
    } else if (isPlainTextAnnotation(annotation)) {
      return serializeW3CTextAnnotation(annotation as TextAnnotation, projectId);
    } else {
      // Should only ever happen for Notes - bodies will be
      // crosswalked in the next mapping step
      return annotation;
    }
  }).map(annotation => {
    const { bodies, body, ...rest } = annotation as any;
    return {
      ...rest,
      body: crosswalkAnnotationBodies([...(bodies || []), ...(body || [])])
    }
  });
}