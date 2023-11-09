import { useState } from 'react';
import { useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import type { Policies, Translations } from 'src/Types';
import { useNotes } from './useNotes';
import { Sorter, Sorting, SortSelector } from './SortSelector';
import { NewNote, NewNoteForm } from './NewNote';
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
        <NewNoteForm isPublic={isPublic} />
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