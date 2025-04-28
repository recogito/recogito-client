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

  // Keeps track of annotations that have corrections (by ID)
  const hasCorrection = new Set<string>();

  // Correction annotation ID -> annotation it's a correction to
  const isCorrectionTo = new Map<string, Annotation>();

  const _addAnnotation = store.addAnnotation;
  const _bulkAddAnnotations = store.bulkAddAnnotations;
  const _bulkDeleteAnnotations = store.bulkDeleteAnnotations;
  const _deleteAnnotation = store.deleteAnnotation;

  // Monkey-patch `store.bulkAddAnnotations`
  // - track corrections 
  // - discard annotations that have corrections
  // - delete annotations if this batch includes corrections to them

  store.bulkAddAnnotations = (annotations: Partial<Annotation>[], replace?: boolean, origin?: Origin) => {
    // Annotations in this batch that are themselves corrections to other annotations
    const corrections = annotations.filter(isCorrection);

    // Record mapping between corrections and corrected annotations
    corrections.forEach(a => {
      const correctedId = corrects(a)!;

      hasCorrection.add(correctedId);

      // Note that corrected annotations may arrive AFTER their corrections!
      const correctedAnnotation = store.getAnnotation(correctedId);
      if (a.id && correctedAnnotation) {
        isCorrectionTo.set(a.id, correctedAnnotation);
        _deleteAnnotation(correctedId, Origin.REMOTE);
      }
    });

    // To add: annotations in this batch that have no corrections
    const toAdd = annotations.filter(a => !hasCorrection.has(a.id!));  

    if (annotations.length !== toAdd.length) {
      // For convenience & debugging: log discarded annotations
      const corrected = annotations.filter(a => hasCorrection.has(a.id!));
      console.log('Discarding the following corrected annotations from view:', corrected);
    }

    // Corrected annotations might arrivate AFTER their corrections!
    // Keep track of this case so we can restore later. The implementation
    // below is a bit brute-force, looping through all annotations in 
    // the annotator. But it will normally only happen ONCE, after the  
    // embedded annotations have loaded.
    const corrected = annotations.filter(a => hasCorrection.has(a.id!));
    if (corrected.length > 0) {
      const allCorrections = store.all().filter(isCorrection);

      corrected.forEach(corrected => {
        const correction = allCorrections.find(a => corrects(a) === corrected.id);
        if (correction)
          isCorrectionTo.set(correction.id, corrected as Annotation);
      });
    }

    _bulkAddAnnotations(toAdd, replace, origin);
  }

  // Monkey-patch `store.addAnnotation`
  // - track corrections 
  // - discard the annotation if it has a correction
  // - if this is a correction, delete the annotation it corrects

  store.addAnnotation = (annotation: Partial<Annotation>, origin?: Origin) => {
    // Don't add this annotation if there is already a correction for it
    if (hasCorrection.has(annotation.id!)) return;
    
    // If this annotation is itself a correction, remove the corrected annotation first
    if (isCorrection(annotation)) {
      const correctedId = corrects(annotation)!;

      const correctedAnnotation = store.getAnnotation(correctedId);
      if (annotation.id && correctedAnnotation) {
        isCorrectionTo.set(annotation.id, correctedAnnotation);
        _deleteAnnotation(correctedId, Origin.REMOTE);
      }
    }

    _addAnnotation(annotation, origin);
  }

  // Monkey-patch `store.deleteAnnotation`
  // - track corrections
  // - restore original if this op deletes a correction
  store.deleteAnnotation = (annotationOrId: string | Annotation, origin?: Origin) => {    
    const id = typeof annotationOrId === 'string' ? annotationOrId : annotationOrId.id;
    
    const correctedAnnotation = isCorrectionTo.get(id);
    if (correctedAnnotation) {
      // Restore original that this annotation was a correction to
      _addAnnotation(correctedAnnotation, Origin.REMOTE);
    }

    _deleteAnnotation(annotationOrId, origin);
  }

  // Monkey-patch `store.bulkDeleteAnnotations`
  // - track corrections
  // - restore originals if this op deletes corrections
  store.bulkDeleteAnnotations = (annotationsOrIds: (string | Annotation)[], origin?: Origin) => {
    const ids = annotationsOrIds.map(arg => typeof arg === 'string' ? arg : arg.id);

    // Ids of annotations in this batch that correct other annotations
    const corrections = ids.map(id => isCorrectionTo.get(id)!).filter(Boolean);
    if (corrections.length > 0)
      _bulkAddAnnotations(corrections, false, Origin.REMOTE)
    
    _bulkDeleteAnnotations(annotationsOrIds, origin);
  }

}