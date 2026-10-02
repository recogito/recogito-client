import { useEffect, useRef } from 'react';
import type { Annotation, Annotator } from '@annotorious/react';
import { useAnnotationStore, useAnnotator, useSelection } from '@annotorious/react';
import { useKeyboardUndoRedo } from './useKeyboardUndoRedo';
import type { SupabasePlugin } from '@recogito/annotorious-supabase';

interface UndoStackProps {

  backend: ReturnType<typeof SupabasePlugin>;

  undoEmpty?: boolean;

  keepEmpty?(annotation: Annotation): boolean;

}

export const UndoStack = (props: UndoStackProps) => {
  useKeyboardUndoRedo(props.backend);

  const keepEmpty = useRef(props.keepEmpty);
  keepEmpty.current = props.keepEmpty;

  const anno = useAnnotator<Annotator>();

  const store = useAnnotationStore();

  const created = useRef<Annotation>(null);

  const { selected } = useSelection();

  const deleteIfEmpty = (annotation: Annotation) => {
    const currentState = store!.getAnnotation(annotation.id);
    if (currentState?.bodies.length === 0 && !keepEmpty.current?.(currentState)) {
      store!.deleteAnnotation(currentState);
      if (created.current === annotation)
        created.current = null;
    }
  }

  useEffect(() => {
    if (anno && props.undoEmpty) {
      const onUpsert = (annotation: Annotation) => {
        if (keepEmpty.current?.(annotation)) return;

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
  }, [anno, props.undoEmpty]);

  useEffect(() => {
    if (!props.undoEmpty || !created.current)
      return;

    // Don't run for the initial selection of the 'created' annotation
    if (selected.length === 1 && selected[0].annotation.id === created.current.id)
      return;

    deleteIfEmpty(created.current);
  }, [props.undoEmpty, selected.map(s => s.annotation.id).join(',')]);

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