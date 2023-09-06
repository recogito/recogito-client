import { useMemo, useRef, useState } from 'react';
import type { DocumentInContext, Translations } from 'src/Types';
import { Annotation } from '@components/Annotation';
import { Toolbar } from './Toolbar';
import { createAppearenceProvider, PresenceStack } from '@components/Presence';
import { AnnotationDesktop, ViewMenuPanel } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import {
  Annotorious, 
  AnnotoriousOpenSeadragonAnnotator, 
  ImageAnnotation,
  OpenSeadragonAnnotator,
  OpenSeadragonPopup,
  OpenSeadragonViewer,
  PresentUser,
  SupabasePlugin
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';

const SUPABASE: string = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY: string = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface ImageAnnotationDesktopProps {

  i18n: Translations;

  document: DocumentInContext;

  channelId: string;

}

export const ImageAnnotationDesktop = (props: ImageAnnotationDesktopProps) => {

  const { i18n } = props;

  const anno = useRef<AnnotoriousOpenSeadragonAnnotator>();

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [tool, setTool] = useState<string | null>(null);

  const [usePopup, setUsePopup] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const appearance = useMemo(() => createAppearenceProvider(), []);

  const onConnectError = () =>
    window.location.href = `/${props.i18n.lang}/sign-in`;

  const onChangeViewMenuPanel = (panel: ViewMenuPanel | undefined) => {
    if (panel === ViewMenuPanel.ANNOTATIONS) {
      // Don't use the popup if the annotation list is open
      setUsePopup(false);
    } else {
      if (!usePopup)
        setUsePopup(true)
    }
  }

  const beforeSelectAnnotation = (a?: ImageAnnotation) => {
    if (a && !usePopup && anno.current) {
      // Don't fit the view if the annotation is already selected
      if (anno.current.state.selection.isSelected(a))
        return;

      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

      anno.current.fitBounds(a, { padding: [vh / 2, vw / 2 + 600, vh / 2, (vw  - 600) / 2] });
    }
  }

  return (
    <div className="anno-desktop ia-desktop">
      <Annotorious ref={anno}>
        <OpenSeadragonAnnotator 
          adapter={null}
          tool={tool} 
          keepEnabled={true}>
          
          <AnnotationDesktop.UndoStack 
            undoEmpty={true} />

          <SupabasePlugin
            base={SUPABASE}
            apiKey={SUPABASE_API_KEY} 
            channel={props.channelId}
            layerId={props.document.layers[0].id} 
            appearanceProvider={appearance}
            onPresence={setPresent} 
            onConnectError={onConnectError}
            privacyMode={privacy === 'PRIVATE'} />

          <OpenSeadragonViewer
            className="ia-osd-container"
            options={{
              tileSources: props.document.meta_data?.url,
              gestureSettingsMouse: {
                clickToZoom: false
              },
              showNavigationControl: false,
              crossOriginPolicy: 'Anonymous'
            }} />

          {usePopup && (
            <OpenSeadragonPopup
              popup ={props => (
                <Annotation.Popup 
                  {...props} 
                  present={present} 
                  i18n={i18n} /> )} />
          )}

          <div className="anno-desktop-left">
            <AnnotationDesktop.DocumentMenu
              document={props.document} />
          </div>

          <div className="anno-desktop-right">
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
              onChangeTool={setTool} 
              onChangePrivacy={setPrivacy} />
          </div>
        </OpenSeadragonAnnotator>
      </Annotorious>
    </div>
  )

}