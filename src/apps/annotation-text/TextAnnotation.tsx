import { Annotorious } from '@annotorious/react';
import {
  type PluginInstallationConfig,
  PluginProvider,
} from '@components/Plugins';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentWithContext, MyProfile, Translations } from 'src/Types';
import {
  AuthorColorProvider,
  ColorState,
  FilterState,
} from '@components/AnnotationDesktop';

export interface TextAnnotationProps {
  i18n: Translations;

  document: DocumentWithContext;

  channelId: string;

  plugins: PluginInstallationConfig[];

  styleSheet?: string;

  me: MyProfile;
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
  );
};
