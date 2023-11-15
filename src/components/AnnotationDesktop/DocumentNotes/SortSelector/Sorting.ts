import type { DocumentNote } from '../Types';

export type Sorter = (a: DocumentNote, b: DocumentNote) => number;

const Newest = (a: DocumentNote, b: DocumentNote) =>
  b.created_at.getTime() - a.created_at.getTime();

const Oldest = (a: DocumentNote, b: DocumentNote) =>
  a.created_at.getTime() - b.created_at.getTime();

export const Sorting = { Newest, Oldest };
