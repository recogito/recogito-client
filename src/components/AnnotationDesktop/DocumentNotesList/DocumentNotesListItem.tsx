import type { PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';
import type { DocumentNote, DocumentNoteBody } from './DocumentNote';
import { BaseCard } from '@components/Annotation/Card/BaseCard';
import { PublicComment } from '@components/Annotation/Comment';

interface DocumentNotesListItemProps {

  i18n: Translations;

  note: DocumentNote;

  present: PresentUser;

  showReplyForm?: boolean;

  onDeleteNote(): void;

  onCreateBody(body: DocumentNoteBody): void;

  onDeleteBody(body: DocumentNoteBody): void;

  onUpdateBody(oldValue: DocumentNoteBody, newValue: DocumentNoteBody): void;

}

export const DocumentNotesListItem = (props: DocumentNotesListItemProps) => {

  return (
    <div className="document-notes-list-item annotation-card public">
      <BaseCard 
        showReplyForm={props.showReplyForm}
        annotation={props.note}
        i18n={props.i18n}
        present={props.present}
        comment={props => (
          <PublicComment {...props} />
        )} 
        onCreateBody={props.onCreateBody}
        onDeleteBody={props.onDeleteBody}
        onUpdateBody={props.onUpdateBody}
        onDeleteAnnotation={props.onDeleteNote} />
    </div>
  )

}