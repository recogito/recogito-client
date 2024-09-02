import { ErrorBoundary } from 'react-error-boundary';
import { Annotorious } from '@annotorious/react';
import { PluginProvider, type PluginInstallationConfig } from '@components/Plugins';
import type { DocumentWithContext, MyProfile, Translations } from 'src/Types';
import { ImageAnnotationDesktop } from './ImageAnnotationDesktop';
import { AuthorColorProvider, ColorState, FatalError, FilterState } from '@components/AnnotationDesktop';

export interface ImageAnnotationProps {

  channelId: string;

  document: DocumentWithContext;

  i18n: Translations;

  me: MyProfile;

  plugins: PluginInstallationConfig[];

}

export const ImageAnnotation = (props: ImageAnnotationProps) => {

  const { i18n } = props;

  return (
    <ErrorBoundary 
      fallbackRender={props => (
        <FatalError {...props} i18n={i18n} />
      )}>
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
    </ErrorBoundary>
  )

}
