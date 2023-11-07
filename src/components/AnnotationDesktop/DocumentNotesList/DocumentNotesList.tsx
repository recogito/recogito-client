import { useState } from 'react';
import { ArrowRight, Detective } from '@phosphor-icons/react';
import { useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import TextareaAutosize from 'react-textarea-autosize';
import { Annotation } from '@components/Annotation';
import { Avatar } from '@components/Avatar';
import type { Policies, Translations } from 'src/Types';
import { useNotes } from './useNotes';
import type { DocumentNote } from './DocumentNote';

import './DocumentNotesList.css';

interface DocumentNotesListProps {

  i18n: Translations;

  present: PresentUser[];

  me: PresentUser;

  defaultLayer: string;

  policies?: Policies;

  tagVocabulary?: string[];

}

export const DocumentNotesList = (props: DocumentNotesListProps) => {

  const [addNew, setAddNew] = useState(false);

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const { notes, createNote } = useNotes(me, props.defaultLayer);

  const [value, setValue] = useState('');

  // TODO add different buttons for 'add a note' vs. 'add a private note'
  const isPublic = true;

  const isMine = (n: DocumentNote) => me.id === n.created_by.id;

  const onSubmit = (evt: React.MouseEvent) => {
    evt.preventDefault();

    console.log('saving!');

    createNote(value).then(note => {
      console.log('created note', note);
    });
  }

  return (
    <div className="anno-sidepanel document-notes-list">
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {note.bodies.length === 0 ? (
              isMine(note) ? (              
                <Annotation.EmptyCard
                  private={note.is_private}
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
              note.is_private ? (
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

      {addNew ? (
        <form 
          className="annotation-reply-form no-drag">
            {isPublic ? (
              <Avatar 
                id={me.id} 
                name={me.name || (me as PresentUser).appearance?.label}
                avatar={me.avatar || (me as PresentUser).appearance?.avatar} />
            ) : (
              <Detective className="anonymous" size={20} weight="light" />  
            )}
      
            <TextareaAutosize
              rows={1} 
              maxRows={10} 
              value={value} 
              onChange={evt => setValue(evt.target.value)} />
      
            <button 
              className="send icon-only"
              onClick={onSubmit}>
              <ArrowRight size={18} />
            </button>
          </form>
      ) : (
        <button onClick={() => setAddNew(true)}>Add a note</button>
      )}
    </div>
  )

}