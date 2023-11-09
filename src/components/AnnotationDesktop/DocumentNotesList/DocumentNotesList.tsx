import { useState } from 'react';
import { ArrowRight, Detective } from '@phosphor-icons/react';
import { useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import TextareaAutosize from 'react-textarea-autosize';
import { Avatar } from '@components/Avatar';
import type { Policies, Translations } from 'src/Types';
import { useNotes } from './useNotes';
import { Sorter, Sorting, SortSelector } from './SortSelector';
import { NewNote } from './NewNote';
import type { DocumentNote } from './DocumentNote';
import { DocumentNotesListItem } from './DocumentNotesListItem';

import './DocumentNotesList.css';

interface DocumentNotesListProps {

  i18n: Translations;

  present: PresentUser[];

  me: PresentUser;

  defaultLayer: string;

  channel: string;

  policies?: Policies;

  tagVocabulary?: string[];

}

export const DocumentNotesList = (props: DocumentNotesListProps) => {

  const [addNew, setAddNew] = useState(false);

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const { notes, createNote } = useNotes(me, props.defaultLayer, props.channel);

  const [sorter, setSorter] = useState<Sorter>(() => Sorting.Newest);

  const sorted = notes.sort(sorter);

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
      <div className="document-notes-list-header">
        <NewNote 
          i18n={props.i18n} 
          onCreatePublic={() => setAddNew(true)} 
          onCreatePrivate={() => console.log('todo')} />

        <SortSelector 
          i18n={props.i18n}
          onChange={sorter => setSorter(() => sorter)} />
      </div>

      {addNew && (
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
      )}

      <ul>
        {sorted.map(note => (
          <li key={note.id}>
            <DocumentNotesListItem 
              i18n={props.i18n}
              note={note} 
              present={props.present} />
          </li>
        ))}
      </ul>
    </div>
  )

}