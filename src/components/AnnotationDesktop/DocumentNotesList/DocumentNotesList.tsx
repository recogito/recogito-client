import { useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { supabase } from '@backend/supabaseBrowserClient';
import { Annotation } from '@components/Annotation';
import type { Policies, Translations } from 'src/Types';
import { useNotes } from './useNotes';

interface DocumentNotesListProps {

  i18n: Translations;

  present: PresentUser[];

  me: PresentUser;

  policies?: Policies;

  tagVocabulary?: string[];

}

export const DocumentNotesList = (props: DocumentNotesListProps) => {

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const notes = useNotes(supabase);

  const isMine = (a: SupabaseAnnotation) =>
    me.id === a.target.creator?.id;

  const isPrivate = (a: SupabaseAnnotation) =>
    a.visibility === Visibility.PRIVATE;

  return (
    <div className="anno-sidepanel document-notes-list">
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {note.bodies.length === 0 ? (
              isMine(note) ? (              
                <Annotation.EmptyCard
                  private={isPrivate(note)}
                  i18n={props.i18n}
                  annotation={note} 
                  present={props.present} />
              ) : (
                <Annotation.EmptyCard 
                  typing
                  i18n={props.i18n} 
                  annotation={note} 
                  present={props.present} />              
              )
            ) : (
              isPrivate(note) ? (
                <Annotation.PrivateCard 
                  showReplyForm
                  i18n={props.i18n}
                  annotation={note} 
                  present={props.present}
                  tagVocabulary={props.tagVocabulary} />
              ) : (
                <Annotation.PublicCard 
                  showReplyForm
                  i18n={props.i18n}
                  annotation={note} 
                  present={props.present}
                  policies={props.policies} 
                  tagVocabulary={props.tagVocabulary} />  
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  )

}