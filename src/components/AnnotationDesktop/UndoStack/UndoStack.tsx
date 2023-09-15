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

  const deleteIfEmpty = (annotation: Annotation) => {
    const currentState = store.getAnnotation(annotation.id);
    if (currentState.bodies.length === 0)
      store.deleteAnnotation(currentState);
  }
  
  useEffect(() => {
    if (anno && undoEmpty) {
      const onCreate = (annotation: Annotation) => {
        if (created) {
          // This happens if the user goes directly from 
          // having one empty annotation open to creating
          // a new one! Delete the previous in this case.
          deleteIfEmpty(created);
        }

        setCreated(annotation);
      }
      
      const onDelete = () =>
        setCreated(undefined);

      anno.on('createAnnotation', onCreate);
      anno.on('deleteAnnotation', onDelete);

      return () => {
        anno.off('createAnnotation', onCreate);
        anno.off('deleteAnnotation', onDelete);
      }
    }
  }, [anno, created]);

  useEffect(() => {
    if (!undoEmpty || !created)
      return;

    // Don't run for the initial selection of the 'created'
    // annotation
    if (selected.length === 1 && selected[0].annotation.id === created.id)
      return;

    deleteIfEmpty(created);

    setCreated(undefined);
  }, [selected.map(s => s.annotation.id).join('-'), created]);

  return null;

}