import { NotePencil } from '@phosphor-icons/react';
import { useNotes } from '../DocumentNotes/useNotes';

import './DocumentNotesMenuIcon.css';

interface DocumentNotesMenuIconProps {

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
        aria-label="Show document notes"
        onClick={props.onSelect}>
        <NotePencil />
      </button>

      {unread.length > 0 && (
        <span className="unread-notes">{unread.length}</span>
      )}
    </div>
  )

}