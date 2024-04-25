import type { Annotation, PresentUser } from '@annotorious/react';
import type { Policies, Translations } from 'src/Types';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import { AnnotationCard } from '@components/Annotation/AnnotationCard';

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

  const i18n = {
    ...props.i18n,
    t: {
      ...props.i18n.t,
      'Delete annotation': props.i18n.t['Delete note']
    }
  }

  return (
    <AnnotationCard
      isNote 
      showReplyForm={props.showReplyForm}
      annotation={props.note as unknown as Annotation}
      i18n={i18n}
      policies={props.policies}
      present={props.present}
      onReply={props.onCreateBody}
      onCreateBody={props.onCreateBody}
      onDeleteBody={props.onDeleteBody}
      onUpdateBody={props.onUpdateBody}
      onUpdateAnnotation={() => {}}
      onDeleteAnnotation={props.onDeleteNote} />
  )

}