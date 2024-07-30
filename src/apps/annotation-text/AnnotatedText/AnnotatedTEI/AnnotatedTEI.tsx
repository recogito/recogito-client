import { useAnnotator, type Filter } from '@annotorious/react';
import { DynamicStyle } from '@components/DynamicStyle';
import { CETEIcean, TEIAnnotator } from '@recogito/react-text-annotator';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import { behaviors } from './behaviors';
import { useEmbeddedTEIAnnotations } from './useEmbeddedAnnotations';
import { useEffect } from 'react';
import type { EmbeddedLayer } from 'src/Types';

interface AnnotatedTEIProps {
  
  filter?: Filter;

  initialLoadComplete: boolean;
  
  style?: HighlightStyleExpression;

  styleSheet?: string;

  text?: string;

  onLoadEmbeddedLayers(layers: EmbeddedLayer[]): void;

}

export const AnnotatedTEI = (props: AnnotatedTEIProps) => {

  const anno = useAnnotator();

  const { layers, annotations } = useEmbeddedTEIAnnotations(props.text);

  console.log(layers, annotations);
  

  useEffect(() => {
    if (anno && annotations.length > 0 && props.initialLoadComplete) {
      anno.setAnnotations(annotations, false);
    }
  }, [anno, annotations, props.initialLoadComplete]);

  useEffect(() => {
    if (layers.length > 0)
      props.onLoadEmbeddedLayers(layers);
  }, [layers]);

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