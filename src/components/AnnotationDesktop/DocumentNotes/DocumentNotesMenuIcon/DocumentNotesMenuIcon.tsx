import { NotePencil } from '@phosphor-icons/react';
import { useNotes } from '../DocumentNotes/useNotes';
import type { Translations } from 'src/Types';

interface DocumentNotesMenuIconProps {

  i18n: Translations;

  active?: boolean;

  onSelect(): void;

}

export const DocumentNotesMenuIcon = (props: DocumentNotesMenuIconProps) => {

  const { unread } = useNotes();

  return (
    <div 
      className={props.active ? 'has-notification active' : 'has-notification'}>
      <button
        className={props.active ? 'active' : undefined}
        aria-label={props.i18n.t['Show document notes']}
        onClick={props.onSelect}>
        <NotePencil />
      </button>

      {unread.length > 0 && (
        <span className="notification-bubble">{unread.length}</span>
      )}
    </div>
  )

}