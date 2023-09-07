/**
 * Experimental code to a) prevent creation of empty annotations
 * and b) think about how we can implement undo functionality in 
 * the future.
 */
import { useEffect, useState } from 'react';
import { Annotation, useAnnotationStore, useAnnotations, useAnnotator, useSelection } from '@annotorious/react';

interface UndoStackProps {

  undoEmpty?: boolean;

}

export const UndoStack = (props: UndoStackProps) => {

  const { undoEmpty } = props;

  const anno = useAnnotator();

  const store = useAnnotationStore();

  const [created, setCreated] = useState<Annotation | undefined>();

  const { selected } = useSelection();
  
  useEffect(() => {
    if (anno && undoEmpty) {
      const onCreate = (annotation: Annotation) =>
        setCreated(annotation);
      
      const onDelete = () =>
        setCreated(undefined);

      anno.on('createAnnotation', onCreate);
      anno.on('deleteAnnotation', onDelete);

      return () => {
        anno.off('createAnnotation', onCreate);
        anno.off('deleteAnnotation', onDelete);
      }
    }
  }, [anno]);

  useEffect(() => {
    if (selected.length === 0 && undoEmpty && created) {
      // Check if the create annotation is still empty
      const lastCreated = store.getAnnotation(created.id);

      if (lastCreated.bodies.length === 0) {
        if (created.bodies.length === 0) {
          // The problem: deselect will cause the SupabasePlugin 
          // to store the annotation in the backend, if it changed.
          // 
          // In text mode, the annotation is first created (and stored 
          // in Supabase), then modified as the user drags the selection.
          // When de-selecting, this change will cause the Supabase 
          // plugin to trigger a save request.
          // 
          // If we delete the annotation in this useEffect handler, this
          // will lead to the following sequence of events:
          // 
          // - The user de-selects
          // - The @annotorious/core Lifecycle handler is always the first listener on the selection,
          //   which means that `updateAnnotation` will fire first
          // - The Supabase plugin starts updating with a preflight OPTION request
          // - UndoStack gets notfied of the selection change, causing this effect to run
          // - UndoStack deletes the annotation
          // - The Supabase plugin's store listener archive-deletes the annotation via the RPC
          // - The update OPTIONS request returns
          // - The Supabase plugin sends the PATCH request to update the annotation
          // - The PATCH request fails because the target was alread archived on Supabase
          //
          // The question is how to avoid this situation. One possibility would be to
          // tweak the Lifcycle handler, to emit the `updateAnnotation` after the event loop
          // is done. In this case, the sequence will (hopefully...) change to:
          // 
          // - The user de-selects
          // - Undo stack deletes the annotation
          // - SupabasePlugin archives the annotation
          // - @annotorious/core lifecycle handler executes, but does not emit a change, 
          //   because the annotation is already deleted from the store
          store.deleteAnnotation(lastCreated);
        }
      }

      setCreated(undefined);
    }
  }, [selected, created]);

  return null;

}