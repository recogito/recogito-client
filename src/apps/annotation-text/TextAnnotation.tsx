import { Annotorious } from '@annotorious/react';
import { type PluginInstallationConfig, PluginProvider } from '@components/Plugins';
import { TextAnnotationDesktop } from './TextAnnotationDesktop';
import type { DocumentWithContext, Translations } from 'src/Types';
import { AuthorColorProvider } from '@components/AnnotationDesktop';
import { FilterState } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import { ColorState } from '@components/AnnotationDesktop/ColorCodingSelector/ColorState';

export interface TextAnnotationProps {

  i18n: Translations;

  document: DocumentWithContext;

  channelId: string;

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
  );
};
