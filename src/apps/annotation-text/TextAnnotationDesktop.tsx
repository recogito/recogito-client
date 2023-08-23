import { useRef, useState } from 'react';
import { Annotorious, SupabasePlugin } from '@annotorious/react';
import { 
  TEIAnnotator, 
  TextAnnotator, 
  TextAnnotatorRef, 
  TextAnnotatorPopup 
} from '@recogito/react-text-annotator';
import type { Annotation as Anno, PresentUser } from '@annotorious/react';
import { PresenceStack, createAppearenceProvider } from '@components/Presence';
import { Annotation } from '@components/Annotation';
import { AnnotationDesktop, ViewMenuPanel } from '@components/AnnotationDesktop';
import { Toolbar } from './Toolbar';
import type { DocumentInContext, Translations } from 'src/Types';
import type { PrivacyMode } from '@components/PrivacySelector';
import { TEIContent, PlaintextContent } from './content';

import './TextAnnotationDesktop.css';

import '@recogito/react-text-annotator/dist/react-text-annotator.css';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface TextAnnotationDesktopProps {

  i18n: Translations;

  document: DocumentInContext;

  channelId: string;

}

export const TextAnnotationDesktop = (props: TextAnnotationDesktopProps) => {

  const { i18n } = props;

  const contentType = props.document.content_type;

  const anno = useRef<TextAnnotatorRef>();

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [usePopup, setUsePopup] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  //max number of avatars displayed in the top right
  const limit = 5;

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
      if (anno.current.state.selection.isSelected(a))
        return;

      anno.current.scrollIntoView(a);
    }
  }

  return (
    <div className={contentType === 'text/xml' ? 'content-wrapper tei' : 'content-wrapper text'}>
      <Annotorious ref={anno}>
        <main>
          {contentType === 'text/xml' ? (
            <TEIAnnotator>
              <TEIContent document={props.document} />
            </TEIAnnotator>
          ) : (
            <TextAnnotator
              presence={{
                font: "500 12px Inter, Arial, Helvetica, sans-serif"
              }}>
              <PlaintextContent document={props.document} />
            </TextAnnotator>
          )}
        </main>

        <div className="anno-desktop ta-desktop">
          <SupabasePlugin 
            base={SUPABASE}
            apiKey={SUPABASE_API_KEY} 
            channel={props.channelId}
            layerId={props.document.layers[0].id} 
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

          <div className="anno-desktop-left">
            <AnnotationDesktop.DocumentMenu
              document={props.document} />
          </div>

          <div className="anno-desktop-right not-annotatable">
            <PresenceStack
              present={present}
              limit={limit} />

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
        </div>
      </Annotorious>
    </div>
  )

}