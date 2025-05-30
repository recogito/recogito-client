import type { Annotation, AnnotationBody, PresentUser } from '@annotorious/react';
import type { Policies, Translations, VocabularyTerm } from 'src/Types';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import { AnnotationCard } from '@components/Annotation';

interface DocumentNotesListItemProps {

  i18n: Translations;

  isProjectLocked: boolean;

  isSelected?: boolean;

  isReadOnly?: boolean;

  layerNames: Map<string, string>;

  note: DocumentNote;

  policies?: Policies;

  present: PresentUser[];

  showReplyField?: boolean;

  tagVocabulary?: VocabularyTerm[];

  onBulkDeleteBodies(bodies: AnnotationBody[]): void;

  onDeleteNote(): void;

  onCreateBody(body: DocumentNoteBody): void;

  onDeleteBody(body: DocumentNoteBody): void;

  onNavigateTo(annotationId: string): void;

  onUpdateBody(oldValue: DocumentNoteBody, newValue: DocumentNoteBody): void;

}

export const DocumentNotesListItem = (props: DocumentNotesListItemProps) => {

  const i18n = {
    ...props.i18n,
    t: {
      ...props.i18n.t,
      'Delete annotation': props.i18n.t['Delete note']
    }
  }

  return (
    <AnnotationCard
      autoFocus
      isNote 
      isProjectLocked={props.isProjectLocked}
      isSelected={props.isSelected}
      annotation={props.note as unknown as Annotation}
      i18n={i18n}   
      isReadOnly={props.isReadOnly}
      layerNames={props.layerNames}
      policies={props.policies}    
      present={props.present}
      showReplyField={props.showReplyField}
      tagVocabulary={props.tagVocabulary}
      onBulkDeleteBodies={props.onBulkDeleteBodies}
      onCreateBody={props.onCreateBody}
      onDeleteBody={props.onDeleteBody}
      onUpdateBody={props.onUpdateBody}
      onUpdateAnnotation={() => {}}
      onDeleteAnnotation={props.onDeleteNote} 
      onNavigateTo={props.onNavigateTo}
      onSubmit={() => {}} />
  )

}