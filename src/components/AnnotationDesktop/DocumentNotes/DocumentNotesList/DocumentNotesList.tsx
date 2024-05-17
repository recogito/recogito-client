import { useMemo, useState } from 'react';
import type { AnnotationBody, PresentUser } from '@annotorious/react';
import type { DocumentLayer, Policies, Translations } from 'src/Types';
import { useNotes } from '../DocumentNotes';
import { Sorter, Sorting, SortSelector } from '../SortSelector';
import { NewNote, NewNoteForm } from '../NewNote';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import { DocumentNotesListItem } from './DocumentNotesListItem';

import './DocumentNotesList.css';

interface DocumentNotesListProps {

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

  policies?: Policies;

  tagVocabulary?: string[];

}

export const DocumentNotesList = (props: DocumentNotesListProps) => {

  const [selected, setSelected] = useState<string | undefined>();

  const activeLayer = useMemo(() => (
    (props.layers || []).find(l => l.is_active)
  ), [props.layers]);

  const isReadOnly = (a: DocumentNote) =>
    !(a.layer_id && a.layer_id === activeLayer?.id);

  const { 
    notes,
    markAsRead,
    createBody,
    createNote: _createNote,
    deleteBody,
    deleteNote,
    updateBody
  } = useNotes();

  const [sorter, setSorter] = useState<Sorter>(() => Sorting.Newest);

  const sorted = notes.sort(sorter);

  const [newNote, setNewNote] = useState<'public' | 'private' | undefined>();

  const createNote = (text: string, isPrivate: boolean) => {
    setNewNote(undefined);
    _createNote(text, isPrivate);
  }

  const onSelect = (note: DocumentNote) => (evt: React.MouseEvent) => {    
    evt.stopPropagation();
    setSelected(note.id);
  }

  const onBulkDeleteBodies = (bodies: AnnotationBody[]) =>
    bodies.forEach(b => deleteBody(b as DocumentNoteBody));

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
          <li
            className={note.unread ? 'unread' : undefined}
            key={note.id} 
            onClick={onSelect(note)}
            onPointerEnter={() => note.unread && markAsRead(note.id)}>
              
            <DocumentNotesListItem 
              i18n={props.i18n}
              isReadOnly={isReadOnly(note)}
              layerNames={props.layerNames}
              note={note} 
              showReplyField={selected === note.id}
              policies={props.policies}
              present={props.present} 
              onCreateBody={createBody}
              onDeleteBody={deleteBody}
              onUpdateBody={updateBody}
              onDeleteNote={() => deleteNote(note.id)} 
              onBulkDeleteBodies={onBulkDeleteBodies} />
          </li>
        ))}
      </ul>
    </div>
  )

}