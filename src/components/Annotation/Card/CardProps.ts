import type { Annotation, AnnotationBody, PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';

export interface CardProps {

  i18n: Translations;
  
  annotation: Annotation;
  
  present: PresentUser[];

  showReplyForm?: boolean;

  onReply?(body: AnnotationBody): void;

}