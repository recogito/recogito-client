import { ErrorBoundary } from 'react-error-boundary';
import { Annotorious } from '@annotorious/react';
import { type PluginInstallationConfig, PluginProvider } from '@recogito/studio-sdk';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentWithContext, MyProfile, Translations } from 'src/Types';
import { AuthorColorProvider, ColorState, FatalError, FilterState } from '@components/AnnotationDesktop';

export interface TextAnnotationProps {

  channelId: string;

  document: DocumentWithContext;

  i18n: Translations;

  me: MyProfile;

  plugins: PluginInstallationConfig[];

  styleSheet?: string;

}

export const TextAnnotation = (props: TextAnnotationProps) => {

  const { i18n } = props;

  return (
    <ErrorBoundary 
      fallbackRender={props => (
        <FatalError {...props} i18n={i18n} />
      )}>
      <PluginProvider installed={props.plugins}>
        <AuthorColorProvider>
          <FilterState>
            <ColorState>
              <Annotorious>
                <TextAnnotationDesktop {...props} />
              </Annotorious>
            </ColorState>
          </FilterState>
        </AuthorColorProvider>
      </PluginProvider>
    </ErrorBoundary>
  )

}
