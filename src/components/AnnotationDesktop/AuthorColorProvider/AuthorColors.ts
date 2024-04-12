import type { User } from '@annotorious/react';

// https://wpdatatables.com/data-visualization-color-palette/
const DutchFieldCategorical9 = [
  '#e60049', 
  '#0bb4ff', 
  '#50e991', 
  '#e6d800', 
  '#9b19f5', 
  '#ffa300', 
  '#dc0ab4', 
  '#b3d4ff', 
  '#00bfa0'
];

export interface AuthorColors {

  getColor(user?: User): string | undefined;

}

export const createAuthorPalette = (): AuthorColors => {

  const assignedColors = new Map<string, string>();

  let nextIndex = 0;

  const getColor = (user?: User) => {
    if (!user) return;

    const assigned = assignedColors.get(user.id);
    if (assigned)
      return assigned;

    // Assign next free color
    const nextColor = DutchFieldCategorical9[nextIndex];

    assignedColors.set(user.id, nextColor);

    nextIndex = (nextIndex + 1) % DutchFieldCategorical9.length;

    return nextColor;
  }

  return {
    getColor
  }

}