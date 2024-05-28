import { Annotorious } from '@annotorious/react';
import { type PluginInstallationConfig, PluginProvider } from '@components/Plugins';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentWithContext, MyProfile, Translations } from 'src/Types';
import {
  AuthorColorProvider,
  ColorState,
  FilterState,
} from '@components/AnnotationDesktop';

export interface TextAnnotationProps {

  channelId: string;

  document: DocumentWithContext;

  i18n: Translations;

  me: MyProfile;

  plugins: PluginInstallationConfig[];

  styleSheet?: string;

}

export const TextAnnotation = (props: TextAnnotationProps) => {

  return (
    <PluginProvider plugins={props.plugins}>
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
  )

}
