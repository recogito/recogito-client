import type { Color } from '@annotorious/react';

export const createPalette = (palette: Color[]) => {

  const assignedColors = new Map<string, Color>();

  let nextIndex = 0;

  const getColor = (key: string) => {
    const assigned = assignedColors.get(key);
    if (assigned)
      return assigned;

    // Assign next free color
    const nextColor = palette[nextIndex];

    assignedColors.set(key, nextColor);

    nextIndex = (nextIndex + 1) % palette.length;

    return nextColor;
  }

  return {
    getColor
  }

}