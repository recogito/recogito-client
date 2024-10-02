import { Note} from '@phosphor-icons/react';
import { useNotes } from '../DocumentNotes/useNotes';
import type { Translations } from 'src/Types';

interface DocumentNotesTabButtonProps {

  i18n: Translations;

  onClick(): void;

}

export const DocumentNotesTabButton = (props: DocumentNotesTabButtonProps) => {

  const { t } = props.i18n;

  const { unread } = useNotes();

  return (
    <div 
      className="with-notification">
      <button
        aria-label={props.i18n.t['Show document notes']}
        onClick={props.onClick}>
        <Note size={18} /> {t['Notes']}
      </button>

      {unread.length > 0 && (
        <span className="notification-bubble">{unread.length}</span>
      )}
    </div>
  )

}