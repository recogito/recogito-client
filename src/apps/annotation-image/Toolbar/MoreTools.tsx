import { DotsThreeVertical } from '@phosphor-icons/react';
import type { PresentUser } from '@annotorious/react';
import * as Popover from '@radix-ui/react-popover';
import { ColorCodingSelector, ColorLegend } from '@components/AnnotationDesktop';
import { PrivacySelector, type PrivacyMode } from '@components/PrivacySelector';
import type { DocumentLayer, DocumentWithContext, Translations, VocabularyTerm } from 'src/Types';

interface MoreToolsProps {

  document: DocumentWithContext;

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

  privacy: PrivacyMode;

  tagVocabulary?: VocabularyTerm[];

  onChangePrivacy(mode: PrivacyMode): void;

}

export const MoreTools = (props: MoreToolsProps) => {

  return (
    <Popover.Root>
      <Popover.Trigger>
        <DotsThreeVertical size={18} weight="bold" />
      </Popover.Trigger>

      <Popover.Content 
        className="popover-content anno-more-tools ta-more-tools"
        collisionPadding={10}
        sideOffset={14}>

        <PrivacySelector
          mode={props.privacy}
          i18n={props.i18n}
          onChangeMode={props.onChangePrivacy} />

        <ColorCodingSelector 
          document={props.document}
          i18n={props.i18n} 
          present={props.present} 
          layers={props.layers}
          layerNames={props.layerNames} 
          tagVocabulary={props.tagVocabulary} />

        <ColorLegend 
          i18n={props.i18n} />
      </Popover.Content>
    </Popover.Root>
  )

}