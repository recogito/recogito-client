import type { Color, Annotation } from '@annotorious/react';
import type { LayerConfiguration } from '../LayerConfiguration';

// https://tailwindcolor.com/
// (color brightness 600)
export const Palette = [
  '#DC2626', // red
  '#EA580C', // orange
  '#D97706', // amber
  '#CA8A04', // yellow
  '#65A30D', // lime
  '#16A34A', // green
  '#059669', // emerald
  '#0D9488', // teal
  '#0891B2', // cyan
  '#0284C7', // light blue
  '#2563EB', // blue
  '#4F46E5', // indigo
  '#7C3AED', // violet
  '#9333EA', // purple
  '#C026D3', // fuchsia
  '#DB2777', // pink
  '#E11D48'  // rose
] as Color[];

const getRandomColor = () => {
  const idx = Math.floor(Math.random() * Palette.length);
  return Palette[idx];
}

const assignedColors = new Map<string, Color>();

export const AssignmentConfiguration = (): LayerConfiguration => ({

  // @ts-ignore
  assignedColors: new Map<string, Color>(),

  formatter: (annotation: Annotation) => {
    //@ts-ignore
    const assignedColor = assignedColors.get(annotation.layer_id);
    if (assignedColor) {
      return { fill: assignedColor, fillOpacity: 0.25 };
    } else {
      const rnd = getRandomColor();
      //@ts-ignore
      assignedColors.set(annotation.layer_id, rnd);
      return { fill: rnd, fillOpacity: 0.25 };
    }
  },

  legend: Array.from(assignedColors.entries()).map(([ label, color ]) => ({ color, label }))

})

