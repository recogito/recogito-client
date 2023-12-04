import { NotePencil } from '@phosphor-icons/react';
import { useNotes } from '../DocumentNotes/useNotes';
import type { Translations } from 'src/Types';

import './DocumentNotesMenuIcon.css';

interface DocumentNotesMenuIconProps {

  i18n: Translations;

  active?: boolean;

  onSelect(): void;

}

export const DocumentNotesMenuIcon = (props: DocumentNotesMenuIconProps) => {

  const { unread } = useNotes();

  return (
    <div 
      className={props.active ? 'document-notes-menu-icon active' : 'document-notes-menu-icon'}>
      <button
        className={props.active ? 'active' : undefined}
        aria-label={props.i18n.t['Show document notes']}
        onClick={props.onSelect}>
        <NotePencil />
      </button>

      {unread.length > 0 && (
        <span className="unread-notes">{unread.length}</span>
      )}
    </div>
  )

}