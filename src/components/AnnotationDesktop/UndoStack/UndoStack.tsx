import { useEffect, useRef } from 'react';
import type { Annotation, Annotator } from '@annotorious/react';
import { useAnnotationStore, useAnnotator, useSelection } from '@annotorious/react';

interface UndoStackProps {

  undoEmpty?: boolean;

}

export const UndoStack = (props: UndoStackProps) => {

  const { undoEmpty } = props;

  const anno = useAnnotator<Annotator>();

  const store = useAnnotationStore();

  const created = useRef<Annotation | undefined>();

  const { selected } = useSelection();

  const deleteIfEmpty = (annotation: Annotation) => {
    const currentState = store.getAnnotation(annotation.id);
    if (currentState?.bodies.length === 0) {
      store.deleteAnnotation(currentState);
      if (created.current === annotation)
        created.current = undefined;
    }
  }
  
  useEffect(() => {
    if (anno && undoEmpty) {
      const onUpsert = (annotation: Annotation) => {
        const { current } = created;
        created.current = annotation;

        if (current && current.id !== annotation.id) {
          // This happens if the user goes directly from 
          // having one empty annotation open to creating
          // a new one! Delete the previous in this case.
          deleteIfEmpty(current);
        }
      }
      
      anno.on('createAnnotation', onUpsert);
      anno.on('updateAnnotation', onUpsert);

      return () => {
        anno.off('createAnnotation', onUpsert);
        anno.off('updateAnnotation', onUpsert);
      }
    }
  }, [anno]);

  useEffect(() => {
    if (!undoEmpty || !created.current)
      return;

    // Don't run for the initial selection of the 'created' annotation
    if (selected.length === 1 && selected[0].annotation.id === created.current.id)
      return;

    deleteIfEmpty(created.current);
  }, [selected.map(s => s.annotation.id).join(',')]);

  useEffect(() => {
    const onUnload = () => {
      if (created.current) deleteIfEmpty(created.current);
    };

    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('beforeunload', onUnload);
    }
  }, [selected.map(s => s.annotation.id).join(',')]);

  return null;

}