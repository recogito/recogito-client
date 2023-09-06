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
          // The problem: deselect will store the latest target update.
          // We want to delete the annotation instead. How to best avoid
          // race conditions?
          setTimeout(() => store.deleteAnnotation(lastCreated), 100);
        }
      }

      setCreated(undefined);
    }
  }, [selected, created]);

  return null;

}