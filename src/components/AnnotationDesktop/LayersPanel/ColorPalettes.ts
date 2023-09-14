import type { Color } from '@annotorious/react';

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffle = <T extends any>(array: T[]): T[] => {
  const randomized = [...array];

  // Do the Durstenfeld shuffle!
  for (let i = randomized.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
  }

  return randomized;
}

// https://colorbrewer2.org/
export const ColorBrewerSet1_8 = [
  '#e41a1c',
  '#377eb8',
  '#4daf4a',
  '#984ea3',
  '#ff7f00',
  '#ffff33',
  '#a65628',
  '#f781bf'
] as Color[];

export const ColorBrewerDark2_8 = [
  '#1b9e77',
  '#d95f02',
  '#7570b3',
  '#e7298a',
  '#66a61e',
  '#e6ab02',
  '#a6761d',
  '#666666'
] as Color[];

// https://tailwindcolor.com/
// (color brightness 600)
export const TailwindSequential17 = [
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

// https://wpdatatables.com/data-visualization-color-palette/
export const DutchFieldCategorical9 = [
  '#e60049', 
  '#0bb4ff', 
  '#50e991', 
  '#e6d800', 
  '#9b19f5', 
  '#ffa300', 
  '#dc0ab4', 
  '#b3d4ff', 
  '#00bfa0'
] as Color[];

// https://spectrum.adobe.com/page/color-for-data-visualization/
export const AdobeCategorical6 = [
  '#11b5ae', // cyan
  '#4046ca', // dark blue
  '#f68512', // orange
  '#f22483', // pink
  '#7e84fa', // light blue
  '#72e06a'  // green
] as Color[];

export const AdobeCategorical12 = [
  '#11b5ae', // cyan
  '#4046ca', // dark blue
  '#f68512', // orange
  '#f22483', // pink
  '#7e84fa', // light blue
  '#72e06a', // green
  '#167af3', // blue
  '#7326d3', // purple
  '#e8c600', // yellow
  '#cb5d02', // brown
  '#008f5d', // dark green
  '#bce931'  // mint
] as Color[];

// IBM Carbon Design System
// https://carbondesignsystem.com/data-visualization/color-palettes/
export const CarbonCategoricalDark14 = [
  '#6929c4', // purple 70
  '#1192e8', // cyan 50
  '#005d5d', // teal 70
  '#9f1853', // magenta 70
  '#fa4d56', // red 50
  '#570408', // red 90
  '#198038', // green 60
  '#002d9c', // blue 80
  '#ee538b', // magenta 50
  '#b28600', // yellow 50
  '#009d9a', // teal 50
  '#012749', // cyan 90
  '#8a3800', // orange 70
  '#a56eff'  // purple 50
] as Color[];

export const CarbonCategoricalLight14 = [
  '#8a3ffc', // purple 60
  '#33b1ff', // cyan 40
  '#007d79', // teal 60
  '#ff7eb6', // magenta 40
  '#fa4d56', // red 50
  '#fff1f1', // red 10
  '#6fdc8c', // green 30
  '#4589ff', // blue 50
  '#d12771', // magenta 60
  '#d2a106', // yellow 40
  '#08bdba', // teal 40
  '#bae6ff', // cyan 20
  '#ba4e00', // orange 60
  '#d4bbff' // purple 30
] as Color[];