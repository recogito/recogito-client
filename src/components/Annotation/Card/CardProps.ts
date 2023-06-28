import type { Annotation, AnnotationBody, PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';

export interface CardProps {

  annotation: Annotation;

  className?: string;

  i18n: Translations;
  
  present: PresentUser[];

  showReplyForm?: boolean;

  onReply?(body: AnnotationBody): void;

}