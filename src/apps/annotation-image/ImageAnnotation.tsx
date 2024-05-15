import { Annotorious } from '@annotorious/react';
import { PluginProvider, type PluginInstallationConfig } from '@components/Plugins';
import type { DocumentWithContext, Translations } from 'src/Types';
import { ImageAnnotationDesktop } from './ImageAnnotationDesktop';
import { AuthorColorProvider, ColorState } from '@components/AnnotationDesktop';
import { FilterState } from '@components/AnnotationDesktop/FilterPanel/FilterState';

export interface ImageAnnotationProps {

  i18n: Translations;

  document: DocumentWithContext;

  channelId: string;

  plugins: PluginInstallationConfig[];
  
}

export const ImageAnnotation = (props: ImageAnnotationProps) => {

  return (
    <PluginProvider plugins={props.plugins}>
      <AuthorColorProvider>
        <FilterState>
          <ColorState>
            <Annotorious>
              <ImageAnnotationDesktop {...props} />
            </Annotorious>
          </ColorState>
        </FilterState>
      </AuthorColorProvider>
    </PluginProvider>
  )

}