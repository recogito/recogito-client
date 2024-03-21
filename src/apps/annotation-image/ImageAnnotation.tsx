import { Annotorious } from '@annotorious/react';
import { PluginProvider, type PluginInstallationConfig } from '@components/Plugins';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { ImageAnnotationDesktop } from './ImageAnnotationDesktop';

export interface ImageAnnotationProps {
  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

  plugins: PluginInstallationConfig[]
}

export const ImageAnnotation = (props: ImageAnnotationProps) => {

  return (
    <PluginProvider plugins={props.plugins}>
      <Annotorious>
        <ImageAnnotationDesktop {...props} />
      </Annotorious>
    </PluginProvider>
  )

}