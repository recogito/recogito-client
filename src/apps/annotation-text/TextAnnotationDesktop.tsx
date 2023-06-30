import { useRef, useState } from 'react';
import { Annotorious, SupabasePlugin } from '@annotorious/react';
import type { Annotation as Anno, PresentUser } from '@annotorious/react';
import { PresenceStack, createAppearenceProvider } from '@components/Presence';
import { Annotation } from '@components/Annotation';
import { AnnotationDesktop, ViewMenuPanel } from '@components/AnnotationDesktop';
import { Toolbar } from './Toolbar';
import type { Document, Layer, Translations } from 'src/Types';
import type { PrivacyMode } from '@components/PrivacySelector';
import {
  TextAnnotator, 
  TextAnnotatorRef, 
  TextAnnotatorPopup 
} from '@recogito/react-text-annotator';

import './TextAnnotationDesktop.css';

import '@recogito/react-text-annotator/dist/react-text-annotator.css';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface TextAnnotationDesktopProps {

  i18n: Translations;

  document: Document;

  layers: Layer[];

  channelId: string;

}

export const TextAnnotationDesktop = (props: TextAnnotationDesktopProps) => {

  const { i18n } = props;

  const anno = useRef<TextAnnotatorRef>();

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [usePopup, setUsePopup] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const onChangeViewMenuPanel = (panel: ViewMenuPanel | undefined) => {
    if (panel === ViewMenuPanel.ANNOTATIONS) {
      // Don't use the popup if the annotation list is open
      setUsePopup(false);
    } else {
      if (!usePopup)
        setUsePopup(true)
    }
  }

  const beforeSelectAnnotation = (a?: Anno) => {
    if (a && !usePopup && anno.current) {
      // Don't fit the view if the annotation is already selected
      if (anno.current.selection.isSelected(a))
        return;

      anno.current.scrollIntoView(a);
    }
  }

  return (
    <div className="anno-desktop ta-desktop">
      <Annotorious ref={anno}>
        <TextAnnotator 
          element="annotatable" 
          presence={{
            font: "500 12px Inter, Arial, Helvetica, sans-serif"
          }} />

        <SupabasePlugin 
          base={SUPABASE}
          apiKey={SUPABASE_API_KEY} 
          channel={props.channelId}
          layerId={props.layers[0].id} 
          appearanceProvider={createAppearenceProvider()}
          onPresence={setPresent} 
          privacyMode={privacy === 'PRIVATE'}/>

        {usePopup && (
          <TextAnnotatorPopup
            popup={props => (
              <Annotation.Popup 
                {...props} 
                present={present} 
                i18n={i18n} />
            )} />
        )}

        <div className="anno-desktop-right not-annotatable">
          <PresenceStack
            present={present} />

          <AnnotationDesktop.ViewMenu 
            i18n={i18n}
            present={present} 
            onChangePanel={onChangeViewMenuPanel}
            beforeSelectAnnotation={beforeSelectAnnotation} />
        </div>

        <div className="anno-desktop-bottom">
          <Toolbar 
            i18n={props.i18n}
            privacy={privacy}
            onChangePrivacy={setPrivacy} />
        </div>
      </Annotorious>
    </div>
  )

}