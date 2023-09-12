import type { Formatter, ImageAnnotation } from '@annotorious/react';

// https://tailwindcolor.com/
// (color brightness 600)
export const Palette = [
  0xDC2626, // red
  0xEA580C, // orange
  0xD97706, // amber
  0xCA8A04, // yellow
  0x65A30D, // lime
  0x16A34A, // green
  0x059669, // emerald
  0x0D9488, // teal
  0x0891B2, // cyan
  0x0284C7, // light blue
  0x2563EB, // blue
  0x4F46E5, // indigo
  0x7C3AED, // violet
  0x9333EA, // purple
  0xC026D3, // fuchsia
  0xDB2777, // pink
  0xE11D48  // rose
];

export const getRandomColor = () => {
  const idx = Math.floor(Math.random() * Palette.length);
  return Palette[idx];
}

const assignedColors = new Map<string, number>();

export const AssignmentFormatter: Formatter = (annotation: ImageAnnotation) => {
  const assignedColor = assignedColors.get(annotation.layer_id);
  if (assignedColor) {
    return { fill: assignedColor };
  } else {
    const rnd = getRandomColor();
    assignedColors.set(annotation.layer_id, rnd);
    return { fill: rnd };
  }
}