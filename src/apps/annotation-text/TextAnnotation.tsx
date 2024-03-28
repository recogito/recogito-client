import { Annotorious } from '@annotorious/react';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { AuthorColorProvider } from '@components/AnnotationDesktop';

export interface TextAnnotationProps {
  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

  styleSheet?: string;
}

/** Wraps the actual text annotation desktop, so we can access Annotorious context **/
export const TextAnnotation = (props: TextAnnotationProps) => {
  return (
    <AuthorColorProvider>
      <Annotorious>
        <TextAnnotationDesktop {...props} />
      </Annotorious>
    </AuthorColorProvider>
  );
};
