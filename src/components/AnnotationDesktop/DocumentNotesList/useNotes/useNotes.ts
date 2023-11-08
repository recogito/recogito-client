import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import type { User } from '@annotorious/react';
import type { DocumentNote } from '../DocumentNote';
import { fetchNotes, insertNote } from './pgOps';
import { supabase } from '@backend/supabaseBrowserClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { ChangeEvent } from '@recogito/annotorious-supabase';

export const useNotes = (me: User, layerId: string, channelId: string) => {

  const [notes, setNotes] = useState<DocumentNote[]>([]);

  useEffect(() => {
    // Should we prevent fetch on re-mount?
    fetchNotes(layerId)
      .then(setNotes)
      .catch(error => {
        console.error(error);
      });

    // Also needs preventing on re-mount. Ideally we'll want to
    // do this via a context provider that gets mounted once and
    // then serves everything down to the child components.
    const onEvent = (evt: RealtimePostgresChangesPayload<ChangeEvent>) => {
      const event = evt as unknown as ChangeEvent;
      // const { table, eventType } = event;

      console.log('YAY', event);
    }

    const channel = supabase.channel(channelId);

    channel
      .on<ChangeEvent>(
      'postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'targets',
          filter: `layer_id=eq.${layerId}`
        }, 
        onEvent
      )
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'bodies',
          filter: `layer_id=eq.${layerId}`
        }, 
        onEvent
      ); 

      channel.subscribe(); 

  }, []);

  // A few Todos left here...
  const createNote = (text: string, isPrivate = false): Promise<DocumentNote> => {
    const annotationId = uuidv4();

    const note = {
      id: annotationId,
      created_at: new Date(),
      created_by: me,    
      is_private: isPrivate,
      layer_id: layerId,
      bodies: [{
        id: uuidv4(),
        annotation_id: annotationId,
        created_at: new Date(),
        created_by: me,      
        purpose: 'commenting',        
        value: text,
        layer_id: layerId
      }]
    };

    return insertNote(note).then(() => note);
  }

  const deleteNote = (annotationId: string) => {

  }

  const appendReply = (annotationId: string, text: string) => {

  }

  const deleteReply = (bodyId: string) => {

  }

  const updateBody = (bodyId: string) => {

  }

  return {
    notes,
    createNote,
    deleteNote,
    appendReply,
    deleteReply,
    updateBody
  }

}