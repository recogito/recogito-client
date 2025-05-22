import { useContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Delta } from 'quill/core';
import { useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import { DocumentNotesContext } from './DocumentNotes';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import type { VocabularyTerm } from 'src/Types';
import { 
  archiveBody, 
  archiveNote,
  insertNote, 
  updateVisibility, 
  upsertBody 
} from './postgres/pgCrud';

export const useNotes = () => {

  const { notes, setNotes, channel, activeLayerId, present, onError } = useContext(DocumentNotesContext);

  const unread = notes.filter(n => n.unread);

  const user = useAnnotatorUser();

  const me: PresentUser | User = useMemo(() => present.find(p => p.id === user?.id) || user, [user]);

  const markAllAsRead = () => 
    setNotes(notes => notes.map(n => ({...n, unread: undefined })));

  const markAsRead = (id: string) => 
    setNotes(notes => notes.map(n => n.id === id ? ({ ...n, unread: undefined }) : n));

  const createNote = (text: Delta, tags: VocabularyTerm[], isPrivate = false) => {
    const before = notes;

    const annotationId = uuidv4();

    const note = {
      id: annotationId,
      created_at: new Date(),
      created_by: me,    
      is_private: isPrivate,
      layer_id: activeLayerId,
      bodies: [{
        id: uuidv4(),
        annotation: annotationId,
        created: new Date(),
        creator: me,      
        purpose: 'commenting',        
        format: 'Quill',
        value: JSON.stringify(text),
        layer_id: activeLayerId
      }, ...tags.map(tag => ({
        id: uuidv4(),
        annotation: annotationId,
        created: new Date(),
        creator: me,      
        purpose: 'tagging',        
        value: tag.id ? JSON.stringify(tag) : JSON.stringify({ label: tag.label }),
        layer_id: activeLayerId
      }))]
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
            payload: { from: me, events: [{ type: 'PUBNOTE', note: publicNote }] }
          });

          setNotes(notes => notes.map(n => n.id === note.id ? publicNote : n));
        }
      })
  }

  const createBody = (body: DocumentNoteBody) => {
    setNotes(notes => notes.map(n => n.id === body.annotation ? 
      ({
        ...n,
        bodies: [...n.bodies, body]
      }) : n));
    
    upsertBody({...body, layer_id: activeLayerId! })
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

  const deleteBody = (body: DocumentNoteBody) => {
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

  const updateBody = (oldValue: DocumentNoteBody, newValue: DocumentNoteBody) => {
    if (oldValue.annotation !== newValue.annotation || oldValue.id !== newValue.id)
      throw 'Integrity violation: body update with different body IDs';

    const bodies = [ ...(notes.find(n => n.id === oldValue.annotation)?.bodies || [])];

    setNotes(notes => notes.map(n => n.id === oldValue.annotation ? ({
      ...n,
      bodies: n.bodies.map(b => b.id === oldValue.id ? newValue : b)
    } as DocumentNote) : n));

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
    activeLayerId,
    notes,
    unread,
    markAllAsRead,
    markAsRead,
    createNote,
    deleteNote,
    makePublic,
    createBody,
    deleteBody,
    updateBody
  }

}