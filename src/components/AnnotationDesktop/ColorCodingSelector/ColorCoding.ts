import type { Color, DrawingStyleExpression, ImageAnnotation } from '@annotorious/react';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';

export interface ColorCoding {

  name: string;

  style: DrawingStyleExpression<ImageAnnotation> | HighlightStyleExpression;

  legend: ColorLegendValue[];

}

export interface ColorLegendValue {

  color: Color;
  
  label: string;

  className?: string

}