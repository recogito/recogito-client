import type { AnnotationBody, PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';

export interface CommentProps {

  index: number;

  comment: AnnotationBody;

  editable?: boolean

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  present: PresentUser[];
  
}