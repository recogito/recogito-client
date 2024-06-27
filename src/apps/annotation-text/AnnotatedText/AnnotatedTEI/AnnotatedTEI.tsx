import { useAnnotator, type Filter } from '@annotorious/react';
import { DynamicStyle } from '@components/DynamicStyle';
import { CETEIcean, TEIAnnotator } from '@recogito/react-text-annotator';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import { behaviors } from './behaviors';
import { useEmbeddedTEIAnnotations } from './useEmbeddedAnnotations';
import { useEffect } from 'react';

interface AnnotatedTEIProps {
  
  filter?: Filter;

  initialLoadComplete: boolean;
  
  style?: HighlightStyleExpression;

  styleSheet?: string;

  text?: string;

}

export const AnnotatedTEI = (props: AnnotatedTEIProps) => {

  const anno = useAnnotator();

  const embedded = useEmbeddedTEIAnnotations(props.text);

  useEffect(() => {
    if (anno && embedded.length > 0 && props.initialLoadComplete) {
      anno.setAnnotations(embedded, false);
    }
  }, [anno, embedded, props.initialLoadComplete]);

  return (
    <>
      <DynamicStyle style={props.styleSheet} />
    
      <TEIAnnotator
        filter={props.filter}
        style={props.style}
        presence={{
          font: '500 12px Inter, Arial, Helvetica, sans-serif',
        }}>
        <CETEIcean 
          tei={props.text} 
          behaviors={behaviors} />
      </TEIAnnotator>
    </>
  )

}