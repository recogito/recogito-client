import { supabase } from '@backend/supabaseBrowserClient';
import type { DocumentNote } from '../DocumentNote';

// Shorthand
const toDate = (str: string) => str ? new Date(str) : null;

export const fetchNotes = (layerId: string): Promise<DocumentNote[]> =>
  new Promise((resolve, reject) => {
    supabase
      .from('annotations')
      .select(`
        id,
        created_at,
        created_by:profiles!annotations_created_by_fkey(
          id,
          nickname,
          first_name,
          last_name,
          avatar_url
        ),
        updated_at,
        updated_by:profiles!annotations_updated_by_fkey(
          id,
          nickname,
          first_name,
          last_name,
          avatar_url
        ),
        is_private,
        layer_id,
        bodies ( 
          id,
          annotation_id,
          created_at,
          created_by:profiles!bodies_created_by_fkey(
            id,
            nickname,
            first_name,
            last_name,
            avatar_url
          ),
          updated_at,
          updated_by:profiles!bodies_updated_by_fkey(
            id,
            nickname,
            first_name,
            last_name,
            avatar_url
          ),
          purpose,
          value,
          layer_id
        ),
        targets ( id ) 
      `)
      .eq('layer_id', layerId)
      .is('targets', null)
      .then(({ data, error }) => {
        console.log(data);
        if (error) {
          reject(error);
        } else {
          // 'data' already complies to the DocumentNote type, with one 
          // exception: dates are still strings -> revive!
          // @ts-ignore
          const revived: DocumentNote[] = data.map(note => ({
            ...note,
            created_at: toDate(note.created_at)!,
            updated_at: toDate(note.updated_at),
            bodies: note.bodies.map(body => ({
              ...body,
              created_at: toDate(note.created_at)!,
              updated_at: toDate(note.updated_at)
            }))
          }));

          resolve(revived);
        }
      });
  });

export const insertNote = (note: DocumentNote) => {
  const createAnnotation = () =>
    supabase
      .from('annotations')
      .insert({
        id: note.id,    
        is_private: note.is_private,
        layer_id: note.layer_id
      });

  const createBodies = () => 
    supabase
    .from('bodies')
    .insert(note.bodies.map(n => ({
      id: n.id,
      annotation_id: n.annotation_id,
      purpose: n.purpose,
      value: n.value,
      layer_id: n.layer_id
    })));

  return new Promise<void>((resolve, reject) => {
    createAnnotation().then(({ error }) => {
      if (error) {
        reject(error)
      } else {
        createBodies().then(({ error }) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        })
      }
    })
  });

}