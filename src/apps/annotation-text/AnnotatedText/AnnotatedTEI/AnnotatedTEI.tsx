import type { Filter } from '@annotorious/react';
import { DynamicStyle } from '@components/DynamicStyle';
import { CETEIcean, TEIAnnotator } from '@recogito/react-text-annotator';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import { behaviors } from './behaviors';

interface AnnotatedTEIProps {
  
  filter?: Filter;
  
  style?: HighlightStyleExpression;

  styleSheet?: string;

  text?: string;

}

export const AnnotatedTEI = (props: AnnotatedTEIProps) => {

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