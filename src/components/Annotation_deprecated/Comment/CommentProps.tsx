import type { AnnotationBody, PresentUser } from '@annotorious/react';
import type { Policies, Translations } from 'src/Types';

export interface CommentProps {

  index: number;

  comment: AnnotationBody;

  editable?: boolean

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  present: PresentUser[];

  policies?: Policies;
  
  onDeleteAnnotation(): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

  
}