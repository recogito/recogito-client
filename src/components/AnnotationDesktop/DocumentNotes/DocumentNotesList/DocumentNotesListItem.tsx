import type { Annotation, AnnotationBody, PresentUser } from '@annotorious/react';
import type { Policies, VocabularyTerm } from 'src/Types';
import type { DocumentNote, DocumentNoteBody } from '../Types';
import { AnnotationCard } from '@components/Annotation';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

interface DocumentNotesListItemProps {

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

  onNavigateTo(annotation: SupabaseAnnotation): void;

  onUpdateBody(oldValue: DocumentNoteBody, newValue: DocumentNoteBody): void;

}

export const DocumentNotesListItem = (props: DocumentNotesListItemProps) => {

  return (
    <AnnotationCard
      autoFocus
      isNote 
      isProjectLocked={props.isProjectLocked}
      isSelected={props.isSelected}
      annotation={props.note as unknown as Annotation}
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