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

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const [selected, setSelected] = useState<DocumentNote | undefined>();

  const { 
    notes,
    createBody,
    createNote: _createNote,
    deleteBody,
    deleteNote,
    updateBody
  } = useNotes(me, props.defaultLayer, props.channel);

  const [sorter, setSorter] = useState<Sorter>(() => Sorting.Newest);

  const sorted = notes.sort(sorter);

  const [newNote, setNewNote] = useState<'public' | 'private' | undefined>();

  const createNote = (text: string, isPrivate: boolean) =>
    _createNote(text, isPrivate).then(() => setNewNote(undefined));

  const onSelect = (note: DocumentNote) => (evt: React.MouseEvent) => {    
    evt.stopPropagation();
    setSelected(note);
  }

  return (
    <div className="anno-sidepanel document-notes-list">
      <div className="document-notes-list-header">
        <NewNote 
          i18n={props.i18n} 
          onCreatePublic={() => setNewNote('public')} 
          onCreatePrivate={() => setNewNote('private')} />

        <SortSelector 
          i18n={props.i18n}
          onChange={sorter => setSorter(() => sorter)} />
      </div>

      {newNote && (
        <NewNoteForm 
          i18n={props.i18n}
          isPrivate={newNote === 'private'} 
          onCreateNote={createNote}
          onCancel={() => setNewNote(undefined)} />
      )}

      <ul>
        {sorted.map(note => (
          <li key={note.id} onClick={onSelect(note)}>
            <DocumentNotesListItem 
              i18n={props.i18n}
              note={note} 
              showReplyForm={selected === note}
              present={props.present} 
              onCreateBody={createBody}
              onDeleteBody={deleteBody}
              onUpdateBody={updateBody}
              onDeleteNote={() => deleteNote(note.id)} />
          </li>
        ))}
      </ul>
    </div>
  )

}