import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnnotationRecord, BodyRecord, TargetRecord, Visibility } from '@recogito/annotorious-supabase';
import type { User } from '@annotorious/react';
import type { DocumentNote } from '../DocumentNote';

export const useNotes = (me: User, layer_id: string) => {

  const [notes, setNotes] = useState<DocumentNote[]>([]);

  // A few Todos left here...
  const createNote = (text: string, visibility: Visibility) => {

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