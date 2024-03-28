import { Annotorious } from '@annotorious/react';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { ImageAnnotationDesktop } from './ImageAnnotationDesktop';
import { AuthorColorProvider } from '@components/AnnotationDesktop';

export interface ImageAnnotationProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

}

export const ImageAnnotation = (props: ImageAnnotationProps) => {

  return (
    <AuthorColorProvider>
      <Annotorious>
        <ImageAnnotationDesktop {...props} />
      </Annotorious>
    </AuthorColorProvider>
  )

}