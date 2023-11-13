import type { PresentUser } from '@annotorious/react';
import type { ChangeEvent } from '@recogito/annotorious-supabase';
import type { RealtimeMessage, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { BroadcastEvent, BroadcastMessage, DocumentNote } from '../../Types';
import { findUser, parseBodyRecord } from './utils';

export const handleCDCEvent = (
  present: PresentUser[],
  setNotes: React.Dispatch<React.SetStateAction<DocumentNote[]>>,
) => (
  evt: RealtimePostgresChangesPayload<ChangeEvent>
) => {
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

export const handleBroadcastEvent = (
  setNotes: React.Dispatch<React.SetStateAction<DocumentNote[]>>
) => (event: {
  [key: string]: any;
  type: 'broadcast';
  event: string;
}) => {
  const { events } = event.payload as BroadcastMessage;

  events.forEach(event => {
    if (event.type === 'DELNOTE') {
      setNotes(notes => notes.filter(n => n.id !== event.id));
    } else if (event.type === 'PUBNOTE') {
      setNotes(notes => ([...notes, event.note]));
    } else if (event.type === 'DELNOTEBDY') {
      setNotes(notes => notes.map(n => n.id === event.annotation ? ({
        ...n,
        bodies: n.bodies.filter(b => b.id !== event.id)
      }) : n));
    }
  });

}
