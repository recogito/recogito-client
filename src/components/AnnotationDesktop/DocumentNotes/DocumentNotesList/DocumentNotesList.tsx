import { useMemo, useState } from 'react';
import type { Delta } from 'quill/core';
import { useAnnotatorUser } from '@annotorious/react';
import type { User, AnnotationBody, PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { Layer, Policies, Translations, VocabularyTerm } from 'src/Types';
import { useNotes } from '../DocumentNotes';
import { type Sorter, Sorting, SortSelector } from '../SortSelector';
import { EmptyNote, NewNoteButton } from '../NewNote';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import { DocumentNotesListItem } from './DocumentNotesListItem';

import './DocumentNotesList.css';

interface DocumentNotesListProps {

  i18n: Translations;

  isProjectLocked: boolean;

  layers?: Layer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

  policies?: Policies;

  tagVocabulary?: VocabularyTerm[];

  onNavigateTo(annotation: SupabaseAnnotation): void;

}

export const DocumentNotesList = (props: DocumentNotesListProps) => {

  const user = useAnnotatorUser();

  const me: PresentUser | User = useMemo(() => props.present.find(p => p.id === user?.id) || user, [user]);

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
  
  const createNote = (content: Delta, tags: VocabularyTerm[], isPrivate: boolean) => {
    setNewNote(undefined);
    _createNote(content, tags, isPrivate);
  }

  const onSelect = (note: DocumentNote) => (evt: React.MouseEvent) => {    
    evt.stopPropagation();
    setSelected(note.id);
  }

  const onBulkDeleteBodies = (bodies: AnnotationBody[]) =>
    bodies.forEach(b => deleteBody(b as DocumentNoteBody));

  const className= [
    'anno-drawer-panel document-notes-list',
    selected ? 'has-selected' : undefined
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <div className="document-notes-list-header">
        {props.isProjectLocked ? (
          <div className="spacer" />
        ) : (
          <NewNoteButton 
            i18n={props.i18n} 
            onCreatePublic={() => setNewNote('public')} 
            onCreatePrivate={() => setNewNote('private')} />
        )}

        <SortSelector 
          i18n={props.i18n}
          onChange={sorter => setSorter(() => sorter)} />
      </div>

      {(!props.isProjectLocked && newNote) && (
        <EmptyNote
          i18n={props.i18n}
          isPrivate={newNote === 'private'} 
          me={me}
          tagVocabulary={props.tagVocabulary}
          present={props.present}
          onNavigateTo={props.onNavigateTo}
          onSubmit={createNote} 
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
              isProjectLocked={props.isProjectLocked}
              isReadOnly={isReadOnly(note)}
              isSelected={selected === note.id}
              layerNames={props.layerNames}
              note={note} 
              showReplyField={selected === note.id && !(isReadOnly(note))}
              policies={props.policies}
              present={props.present} 
              tagVocabulary={props.tagVocabulary}
              onCreateBody={createBody}
              onDeleteBody={deleteBody}
              onUpdateBody={updateBody}
              onDeleteNote={() => deleteNote(note.id)} 
              onNavigateTo={props.onNavigateTo}
              onBulkDeleteBodies={onBulkDeleteBodies} />
          </li>
        ))}
      </ul>
    </div>
  )

}