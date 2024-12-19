import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { DocumentNote } from '../Types';

export type Sorter = (a: DocumentNote, b: DocumentNote) => number;

const Newest = (a: DocumentNote | SupabaseAnnotation, b: DocumentNote | SupabaseAnnotation) => {
  const createdA = 'created_at' in a ? a.created_at : a.target.created;
  const createdB = 'created_at' in b ? b.created_at : b.target.created;
  return createdA && createdB ? createdB.getTime() - createdA.getTime() : 0;
}

const Oldest = (a: DocumentNote | SupabaseAnnotation, b: DocumentNote | SupabaseAnnotation) => {
  const createdA = 'created_at' in a ? a.created_at : a.target.created;
  const createdB = 'created_at' in b ? b.created_at : b.target.created;
  return createdA && createdB ? createdA.getTime() - createdB.getTime() : 0;
}

export const Sorting = { Newest, Oldest };
