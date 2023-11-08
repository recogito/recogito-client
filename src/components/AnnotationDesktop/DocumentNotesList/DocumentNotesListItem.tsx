import type { PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';
import type { DocumentNote } from './DocumentNote';
import { BaseCard } from '@components/Annotation/Card/BaseCard';
import { PublicComment } from '@components/Annotation/Comment';

interface DocumentNotesListItemProps {

  i18n: Translations;

  note: DocumentNote;

  present: PresentUser

}

export const DocumentNotesListItem = (props: DocumentNotesListItemProps) => {

  console.log('note', props.note);

  return (
    <div className="document-notes-list-item">
      <BaseCard 
        annotation={props.note}
        i18n={props.i18n}
        present={props.present}
        comment={props => (
          <PublicComment {...props} />
        )}/>
    </div>
  )

}