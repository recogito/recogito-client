import { Annotorious } from '@annotorious/react';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { ImageAnnotationDesktop } from './ImageAnnotationDesktop';

export interface ImageAnnotationProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

}

export const ImageAnnotation = (props: ImageAnnotationProps) => {

  return (
    <Annotorious>
      <ImageAnnotationDesktop {...props} />
    </Annotorious>
  )

}