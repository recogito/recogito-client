import type { Annotation, AnnotationBody, PresentUser } from '@annotorious/react';
import type { Policies, Translations } from 'src/Types';

export interface CardProps {

  annotation: Annotation;

  className?: string;

  i18n: Translations;
  
  present: PresentUser[];

  policies?: Policies;

  showReplyForm?: boolean;

  tagVocabulary?: string[];

  onReply?(body: AnnotationBody): void;

}