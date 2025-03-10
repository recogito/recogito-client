import { useAnnotator, type Filter } from '@annotorious/react';
import { DynamicStyle } from '@components/DynamicStyle';
import { CETEIcean, TEIAnnotator } from '@recogito/react-text-annotator';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import type { DocumentNote } from '@components/AnnotationDesktop';
import { behaviors } from './behaviors';
import { useEmbeddedTEIAnnotations } from './useEmbeddedAnnotations';
import { useEffect } from 'react';
import type { EmbeddedLayer } from 'src/Types';

interface AnnotatedTEIProps {
  
  filter?: Filter;

  initialLoadComplete: boolean;

  isLocked: boolean;
  
  style?: HighlightStyleExpression;

  styleSheet?: string;

  text?: string;

  onLoadEmbeddedLayers(layers: EmbeddedLayer[], notes: DocumentNote[]): void;

}

export const AnnotatedTEI = (props: AnnotatedTEIProps) => {

  const anno = useAnnotator();

  const { layers, annotations, notes } = useEmbeddedTEIAnnotations(props.text);

  useEffect(() => {
    if (anno && annotations.length > 0 && props.initialLoadComplete) {
      anno.setAnnotations(annotations, false);
    }
  }, [anno, annotations, props.initialLoadComplete]);

  useEffect(() => {
    if (layers.length > 0)
      props.onLoadEmbeddedLayers(layers, notes);
  }, [layers, notes]);

  return (
    <>
      <DynamicStyle style={props.styleSheet} />
    
      <TEIAnnotator
        filter={props.filter}
        annotatingEnabled={!props.isLocked}
        style={props.style}
        presence={{
          font: '500 12px Inter, Arial, Helvetica, sans-serif',
        }}>
        <CETEIcean 
          // @ts-ignore - will start working with the next release!
          initArgs={{ 
            // Disables CETEIcean's default behavior of messing with the URL hash
            ignoreFragmentId: true
          }}
          tei={props.text} 
          behaviors={behaviors} />
      </TEIAnnotator>
    </>
  )

}