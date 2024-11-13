import { DotsThreeVertical } from '@phosphor-icons/react';
import type { PresentUser } from '@annotorious/react';
import * as Popover from '@radix-ui/react-popover';
import { ColorCodingSelector, ColorLegend } from '@components/AnnotationDesktop';
import type { DocumentLayer, DocumentWithContext, Translations, VocabularyTerm } from 'src/Types';
import { PDFControls } from './PDFControls';

import './MoreTools.css';


interface MoreToolsProps {

  document: DocumentWithContext;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  i18n: Translations;

  isPDF: boolean;

  present: PresentUser[];

  tagVocabulary: VocabularyTerm[];

}

export const MoreTools = (props: MoreToolsProps) => {

  return (
    <Popover.Root>
      <Popover.Trigger>
        <DotsThreeVertical size={18} weight="bold" />
      </Popover.Trigger>

      <Popover.Content 
        className="popover-content anno-more-tools ta-more-tools"
        sideOffset={4}>
        <PDFControls i18n={props.i18n} />

        <div className="anno-toolbar-divider" />

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