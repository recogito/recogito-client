import { Annotorious } from '@annotorious/react';
import { type PluginInstallationConfig, PluginProvider } from '@components/Plugins';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { AuthorColorProvider } from '@components/AnnotationDesktop';

export interface TextAnnotationProps {
  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

  plugins: PluginInstallationConfig[];

  styleSheet?: string;
}

/** Wraps the actual text annotation desktop, so we can access Annotorious context **/
export const TextAnnotation = (props: TextAnnotationProps) => {
  return (
    <PluginProvider plugins={props.plugins}>
      <AuthorColorProvider>
        <Annotorious>
          <TextAnnotationDesktop {...props} />
        </Annotorious>
      </AuthorColorProvider>
    </PluginProvider>
  );
};
