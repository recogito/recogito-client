import { supabase } from '@backend/supabaseBrowserClient';
import type { DocumentNote, DocumentNoteBody } from '../../Types';
import { toDate } from './utils';

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
          annotation:annotation_id,
          created:created_at,
          creator:profiles!bodies_created_by_fkey(
            id,
            name:nickname,
            first_name,
            last_name,
            avatar:avatar_url
          ),
          updated:updated_at,
          updatedBy:profiles!bodies_updated_by_fkey(
            id,
            name:nickname,
            first_name,
            last_name,
            avatar:avatar_url
          ),
          purpose,
          value,
          layer_id
        ),
        targets!inner ( 
          id,
          annotation_id,
          layer_id,
          value
        ) 
      `)
      .eq('layer_id', layerId)
      .is('targets.value', null)
      .then(({ data, error }) => {
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
              created: toDate(body.created)!,
              updated: toDate(body.updated)
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

  const createTarget = () => 
    supabase
      .from('targets')
      .insert({
        annotation_id: note.id,
        layer_id: note.layer_id
      });

  const createBodies = () => 
    supabase
      .from('bodies')
      .insert(note.bodies.map(b => ({
        id: b.id,
        annotation_id: b.annotation,
        created_at: b.created,
        created_by: b.creator.id,
        purpose: b.purpose,
        value: b.value,
        layer_id: b.layer_id
      })));

  return new Promise<void>((resolve, reject) => {
    createAnnotation().then(({ error }) => {
      if (error) {
        reject(error)
      } else {
        Promise.all([createTarget(), createBodies()])
          .then(([a, b]) => {  
            if (a.error) {
              reject(error);
            } else if (b.error) {
              reject(error);
            } else {
              resolve();
            }
          });
      }
    })
  });
}

export const updateVisibility = (note: DocumentNote) => 
  supabase
    .from('annotations')
    .update({
      is_private: note.is_private
    })
    .eq('id', note.id); 

export const archiveNote = (id: string) => new Promise<void>((resolve, reject) =>
  supabase
    .rpc('archive_record_rpc', {
      _table_name: 'annotations',
      _id: id
    })
    .then(({ error }) => {
      if (error)
        reject(error);
      else
        resolve();
    }));

export const upsertBody = (b: DocumentNoteBody) =>
  supabase
    .from('bodies')
    .upsert({
      id: b.id,
      created_at: b.created,
      created_by: b.creator.id,
      updated_at: b.created,
      updated_by: b.updatedBy?.id,
      annotation_id: b.annotation,
      format: b.format,
      purpose: b.purpose,
      value: b.value,
      layer_id: b.layer_id
    });

export const archiveBody = (b: DocumentNoteBody) =>
  supabase
    .rpc('archive_record_rpc', {
      _table_name: 'bodies',
      _id: b.id
    });