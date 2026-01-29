import { ErrorBoundary } from 'react-error-boundary';
import { Annotorious } from '@annotorious/react';
import { type PluginInstallationConfig, PluginProvider } from '@recogito/studio-sdk';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentWithContext, MyProfile } from 'src/Types';
import { AuthorColorProvider, ColorState, FatalError, FilterState } from '@components/AnnotationDesktop';
import { I18nextProvider } from 'react-i18next';
import clientI18next from 'src/i18n/client';

export interface TextAnnotationProps {

  channelId: string;

  document: DocumentWithContext;

  me: MyProfile;

  plugins: PluginInstallationConfig[];

  styleSheet?: string;

}

export const TextAnnotation = (props: TextAnnotationProps) => {

  return (
    <I18nextProvider i18n={clientI18next}>
      <ErrorBoundary 
        fallbackRender={props => (
          <FatalError {...props} />
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
    </I18nextProvider>
  )

}
