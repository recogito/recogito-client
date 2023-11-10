import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { ChangeEvent } from '@recogito/annotorious-supabase';
import type { DocumentNote } from '../DocumentNote';
import { supabase } from '@backend/supabaseBrowserClient';
import { findUser, parseBodyRecord } from './utils';
import { 
  archiveBody, 
  archiveNote, 
  fetchNotes, 
  insertNote, 
  upsertBody 
} from './pgOps';

export const useNotes = (me: User, present: PresentUser[], layerId: string, channelId: string) => {

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
      const { table, eventType } = event;

      if (table === 'targets' && eventType === 'INSERT') {
        const target = event.new;

        // Ignore, unless 'value' is null (= note!)
        if (!target.value) {
          setNotes(notes => {
            const exists = notes.find(n => n.id === target.annotation_id);
            return exists ? notes : [...notes, {
              id: target.annotation_id,
              created_at: new Date(target.created_at),
              created_by: findUser(target.created_by, present),
              layer_id: target.layer_id,
              bodies: []
            }];
          });
        }
      } else if (table === 'bodies' && eventType === 'INSERT') {
        const body = event.new;

        // Insert a little wait time, to make sure setNotes has
        // completed, in case this was a new note!
        setTimeout(() => {
          setNotes(notes => {
            // CDC will report our own INSERTs, too - don't create duplicates!
            const exists = notes.some(note => note.bodies.some(b => b.id === body.id));
            if (exists)
              return notes;

            return notes.map(note =>
              (note.id === body.annotation_id) ? ({
                ...note,
                bodies: [...note.bodies, parseBodyRecord(body, present, note)]
              }) : note) 
          });
        }, 250);        
      } else if (table === 'bodies' && eventType === 'UPDATE') {
        const body = event.new;

        setNotes(notes => notes.map(note => note.id === body.annotation_id ? ({
          ...note,
          bodies: note.bodies.map(b => b.id === body.id ? parseBodyRecord(body, present, note) : b)
        }) : note));
      }
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

  const createNote = (text: string, isPrivate = false) => {
    const annotationId = uuidv4();

    const note = {
      id: annotationId,
      created_at: new Date(),
      created_by: me,    
      is_private: isPrivate,
      layer_id: layerId,
      bodies: [{
        id: uuidv4(),
        annotation: annotationId,
        created: new Date(),
        creator: me,      
        purpose: 'commenting',        
        value: text,
        layer_id: layerId
      }]
    };

    return insertNote(note, me)
      .then(() => {
        console.log('created', note)
        setNotes(notes => [...notes, note]);
      })
      .catch(error => {
        console.error(error);
        // TODO UI feedback
      });
  }

  const deleteNote = (id: string) => {
    archiveNote(id)
      .then(() => {
        setNotes(notes => notes.filter(n => n.id !== id));
      })
      .catch(error => {
        console.error(error);
        // TODO UI feedback
      });
  }

  const createBody = (body: AnnotationBody) => {
    // Instant feedback
    setNotes(notes => notes.map(n => n.id === body.annotation ? 
      ({
        ...n,
        bodies: [...n.bodies, body]
      }) : n));
    
    upsertBody({...body, layer_id: layerId })
      .then(({ error }) => {
        if (error) {
          console.error(error);
          // TODO UI feedback

          // Roll back
          setNotes(notes => notes.map(n => n.id === body.annotation ? 
            ({
              ...n,
              bodies: n.bodies.filter(b => b.id !== body.id)
            }) : n));  
        }
      });      
  }

  const deleteBody = (body: AnnotationBody) => {
    // For potential rollback 
    const bodies = [ ...(notes.find(n => n.id === body.annotation)?.bodies || [])];

    setNotes(notes => notes.map(n => n.id === body.annotation ? ({
      ...n,
      bodies: n.bodies.filter(b => b.id !== body.id)
    }) : n));

    archiveBody(body)
      .then(({ error }) => {
        if (error) {
          console.error(error);
          // TODO UI feedback

          setNotes(notes => notes.map(n => n.id === body.annotation ? ({
            ...n,
            bodies
          }) : n));
        }
      });
  }

  const updateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => {
    if (oldValue.annotation !== newValue.annotation || oldValue.id !== newValue.id)
      throw 'Integrity violation: body update with different body IDs';

    const bodies = [ ...(notes.find(n => n.id === oldValue.annotation)?.bodies || [])];

    setNotes(notes => notes.map(n => n.id === oldValue.annotation ? ({
      ...n,
      bodies: n.bodies.map(b => b.id === oldValue.id ? newValue : b)
    }) : n));

    upsertBody(newValue).then(({ error }) => {
      if (error) {
        console.error(error);
        // TODO UI feedback

        setNotes(notes => notes.map(n => n.id === oldValue.annotation ? ({
          ...n,
          bodies
        }) : n));
      }
    })
  }

  return {
    notes,
    createNote,
    deleteNote,
    createBody,
    deleteBody,
    updateBody
  }

}