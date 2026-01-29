import { Note} from '@phosphor-icons/react';
import { useNotes } from '../DocumentNotes/useNotes';
import { useTranslation } from 'react-i18next';

interface DocumentNotesTabButtonProps {

  onClick(): void;

}

export const DocumentNotesTabButton = (props: DocumentNotesTabButtonProps) => {

  const { t } = useTranslation(['annotation-common', 'common']);

  const { unread } = useNotes();

  return (
    <div 
      className="with-notification">
      <button
        aria-label={t('Show document notes', { ns: 'annotation-common' })}
        onClick={props.onClick}>
        <Note size={18} /> {t('Notes', { ns: 'common' })}
      </button>

      {unread.length > 0 && (
        <span className="notification-bubble">{unread.length}</span>
      )}
    </div>
  )

}