import type { AnnotationBody, PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { Policies, Translations } from 'src/Types';

export interface CardProps {

  annotation: SupabaseAnnotation;

  className?: string;

  i18n: Translations;
  
  present: PresentUser[];

  policies?: Policies;

  showReplyForm?: boolean;

  tagVocabulary?: string[];

  onReply(body: AnnotationBody): void;

  onDeleteAnnotation(): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}