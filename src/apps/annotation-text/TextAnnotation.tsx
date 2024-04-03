import { Annotorious } from '@annotorious/react';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentWithContext, Translations } from 'src/Types';

export interface TextAnnotationProps {
  i18n: Translations;

  document: DocumentWithContext;

  channelId: string;

  styleSheet?: string;
}

/** Wraps the actual text annotation desktop, so we can access Annotorious context **/
export const TextAnnotation = (props: TextAnnotationProps) => {
  return (
    <Annotorious>
      <TextAnnotationDesktop {...props} />
    </Annotorious>
  );
};
