import type { Annotation, Annotator } from '@annotorious/annotorious';
import { Origin } from '@annotorious/react';

// Checks if this annotation is a correction
const isCorrection = (annotation: Partial<Annotation>) =>
  (annotation.bodies || []).some(b => b.purpose === 'correcting' && b.value);

// Gets the ID of the annotations this correction corrects
const corrects = (annotation: Partial<Annotation>) =>
  (annotation.bodies || []).find(b => b.purpose === 'correcting')?.value;

/**
 * An Annotorious plugin that keeps track of "correction annotations". It monkey-
 * patches the Annotator instance's original `addAnnotation` and `bulkAddAnnotations` 
 * and injects the following behavior:
 * - If an annotation is added that is a correction, the original (=corrected) 
 *   annotatation is deleted from the store, and the correction is added.
 * - If an annotation is added that is NOT a correction, the plugin checks if
 *   a correction already exists. The annotation is only added if there is no correction for it yet. 
 */
export const mountPlugin = (anno: Annotator) => {

  const { store } = anno.state;

  const isCorrectedBy = new Map<string, string>();

  const _bulkAddAnnotations = store.bulkAddAnnotations;

  store.bulkAddAnnotations = (annotations: Partial<Annotation>[], replace?: boolean, origin?: Origin) => {
    // Annotations in this batch that are themselves corrections to other annotations
    const corrections = annotations.filter(isCorrection);

    // Record mapping between corrections and corrected annotations
    corrections.forEach(a => {
      const correctsId = corrects(a)!;
      if (a.id) isCorrectedBy.set(correctsId, a.id!);
    });

    // To add: annotations in this batch that have no corrections
    const toAdd = annotations.filter(a => !isCorrectedBy.has(a.id!));    

    if (annotations.length !== toAdd.length) {
      // For convenience & debugging: log discarded annotations
      const corrected = annotations.filter(a => isCorrectedBy.has(a.id!));
      console.log('Discarding the following corrected annotations from view:', corrected);
    }

    _bulkAddAnnotations(toAdd, replace, origin);
  }

  const _addAnnotation = store.addAnnotation;

  store.addAnnotation = (annotation: Partial<Annotation>, origin?: Origin) => {
    // Don't add this annotation if there is already a correction for it
    if (isCorrectedBy.has(annotation.id!)) return;
    
    // If this annotation is itself a correction, remove the corrected annotation first
    if (isCorrection(annotation)) {
      const correctsId = corrects(annotation)!;
      if (annotation.id) isCorrectedBy.set(correctsId, annotation.id);

      store.deleteAnnotation(correctsId, Origin.REMOTE);
    }

    _addAnnotation(annotation, origin);
  }

}