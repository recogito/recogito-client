import { useEffect } from 'react';
import { Annotation, useAnnotator } from '@annotorious/react';

export const LifecycleLogger = () => {
  
  const anno = useAnnotator();

  useEffect(() => {
    if (anno) {
      anno.on('createAnnotation', (annotation: Annotation) => {
        console.log('[Logger] createAnnotation', annotation);
      });

      anno.on('deleteAnnotation', (annotation: Annotation) => {
        console.log('[Logger] deleteAnnotation', annotation);
      });
    
      anno.on('selectionChanged', (annotations: Annotation[]) => {
        console.log('[Logger] selectionChanged', annotations);
      });
    
      anno.on('updateAnnotation', (annotation: Annotation, previous: Annotation) => {
        console.log('[Logger] updateAnnotation', annotation, previous);
      });
    }
  }, [anno]);

  return null;
}