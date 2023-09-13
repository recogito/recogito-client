import type { Color, Formatter, ImageAnnotation } from '@annotorious/react';

export interface LayerConfiguration {

  formatter: Formatter;

  legend: { color: Color; label: string }[];

}