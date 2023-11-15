import type { Annotation, PresentUser } from '@annotorious/react';
import type { Policies, Translations } from 'src/Types';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import { BaseCard } from '@components/Annotation/Card/BaseCard';
import { PrivateComment, PublicComment } from '@components/Annotation/Comment';

interface DocumentNotesListItemProps {

  i18n: Translations;

  note: DocumentNote;

  policies?: Policies;

  present: PresentUser[];

  showReplyForm?: boolean;

  onDeleteNote(): void;

  onCreateBody(body: DocumentNoteBody): void;

  onDeleteBody(body: DocumentNoteBody): void;

  onUpdateBody(oldValue: DocumentNoteBody, newValue: DocumentNoteBody): void;

  onMakePublic(): void;

}

export const DocumentNotesListItem = (props: DocumentNotesListItemProps) => {

  const { onMakePublic } = props;

  const isPrivate = props.note.is_private;

  const i18n = {
    ...props.i18n,
    t: {
      ...props.i18n.t,
      'Delete annotation': props.i18n.t['Delete note']
    }
  }

  return (
    <div className={isPrivate ? 
      'document-notes-list-item annotation-card private' :
      'document-notes-list-item annotation-card public'}>
      <BaseCard 
        showReplyForm={props.showReplyForm}
        annotation={props.note as unknown as Annotation}
        i18n={i18n}
        policies={props.policies}
        present={props.present}
        comment={props => isPrivate ? (
            <PrivateComment {...props} onMakePublic={onMakePublic} />
          ) : (
            <PublicComment {...props} />
          )} 
        onCreateBody={props.onCreateBody}
        onDeleteBody={props.onDeleteBody}
        onUpdateBody={props.onUpdateBody}
        onDeleteAnnotation={props.onDeleteNote} />
    </div>
  )

}