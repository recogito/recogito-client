import type { Color } from '@annotorious/react';

export const createPalette = (palette: Color[]) => {

  const assignedColors = new Map<string, Color>();

  let nextIndex = 0;

  const getColor = (tag: string) => {
    const assigned = assignedColors.get(tag);
    if (assigned)
      return assigned;

    // Assign next free color
    const nextColor = palette[nextIndex];

    assignedColors.set(tag, nextColor);

    nextIndex = (nextIndex + 1) % palette.length;

    return nextColor;
  }

  return {
    getColor
  }

}