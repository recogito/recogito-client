import { useContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, PresentUser, User, useAnnotatorUser } from '@annotorious/react';
import { DocumentNotesContext } from './DocumentNotes';
import type { DocumentNote } from '../Types';
import { 
  archiveBody, 
  archiveNote,
  insertNote, 
  updateVisibility, 
  upsertBody 
} from '../../DocumentNotes/DocumentNotes/postgres/pgCrud';

export const useNotes = () => {

  const { notes, setNotes, channel, layerId, present, onError } = useContext(DocumentNotesContext)

  const user = useAnnotatorUser();

  const me: PresentUser | User = useMemo(() => present.find(p => p.id === user.id) || user, [user]);

  const createNote = (text: string, isPrivate = false) => {
    const before = notes;

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
    } as DocumentNote;

    // Optimistic update
    setNotes(notes => [...notes, note]);

    return insertNote(note)
      .catch(error => {
        onError(error);
        setNotes(before)
      });
  }

  const deleteNote = (id: string) => {
    archiveNote(id)
      .then(() => {
        // Note that archive updates will not trigger a 
        // CDC message, because of RLS. Therefore, we need
        // to send our own update via broadcast.
        channel?.send({
          type: 'broadcast',
          event: 'change',
          payload: { from: me, events: [{ type: 'DELNOTE', id }] }
        });

        setNotes(notes => notes.filter(n => n.id !== id));
      })
      .catch(onError);
  }

  const makePublic = (note: DocumentNote) => {
    const publicNote: DocumentNote = {...note, is_private: false };

    updateVisibility(publicNote)
      .then(({ error }) => {
        if (error) {
          console.error(error);
          // TODO UI feedback
        } else {
          // Note that change of visibility does not trigger a 
          // CDC message, because of RLS. Therefore, we need
          // to send our own update via broadcast.
          channel?.send({
            type: 'broadcast',
            event: 'change',
            payload: { from: me, events: [{ type: 'PUBNOTE', note }] }
          });

          setNotes(notes => notes.map(n => n.id === note.id ? publicNote : n));
        }
      })
  }

  const createBody = (body: AnnotationBody) => {
    setNotes(notes => notes.map(n => n.id === body.annotation ? 
      ({
        ...n,
        bodies: [...n.bodies, body]
      }) : n));
    
    upsertBody({...body, layer_id: layerId })
      .then(({ error }) => {
        if (error) {
          onError(error)

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
    const bodies = [ ...(notes.find(n => n.id === body.annotation)?.bodies || [])];

    setNotes(notes => notes.map(n => n.id === body.annotation ? ({
      ...n,
      bodies: n.bodies.filter(b => b.id !== body.id)
    }) : n));

    archiveBody(body)
      .then(({ error }) => {
        if (error) {
          onError(error);

          setNotes(notes => notes.map(n => n.id === body.annotation ? ({
            ...n,
            bodies
          }) : n));
        } else {
          // Note that change of visibility does not trigger a 
          // CDC message, because of RLS. Therefore, we need
          // to send our own update via broadcast.
          channel?.send({
            type: 'broadcast',
            event: 'change',
            payload: { from: me, events: [{ type: 'DELNOTEBDY', annotation: body.annotation, id: body.id }] }
          });
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
        onError(error);

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
    makePublic,
    createBody,
    deleteBody,
    updateBody
  }

}