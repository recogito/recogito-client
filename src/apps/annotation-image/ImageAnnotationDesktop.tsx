import { useEffect, useMemo, useRef, useState } from 'react';
import type { DocumentInTaggedContext, Layer, Translations } from 'src/Types';
import { getAllLayersInProject, isDefaultContext } from '@backend/helpers';
import { useLayerPolicies } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { Annotation } from '@components/Annotation';
import { createAppearenceProvider, PresenceStack } from '@components/Presence';
import { AnnotationDesktop, ViewMenuPanel } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { Toolbar } from './Toolbar';
import { 
  Annotorious, 
  AnnotoriousOpenSeadragonAnnotator,
  Formatter,
  ImageAnnotation, 
  OpenSeadragonAnnotator,
  OpenSeadragonPopup,
  OpenSeadragonViewer,
  PointerSelectAction,
  PresentUser,
  SupabasePlugin
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';

const SUPABASE: string = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY: string = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface ImageAnnotationDesktopProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

}

export const ImageAnnotationDesktop = (props: ImageAnnotationDesktopProps) => {

  const { i18n } = props;

  const anno = useRef<AnnotoriousOpenSeadragonAnnotator>();

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [tool, setTool] = useState<string | null>(null);

  const [formatter, setFormatter] = useState<Formatter | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [layers, setLayers] = useState<Layer[] | undefined>();

  const appearance = useMemo(() => createAppearenceProvider(), []);

  useEffect(() => {
    if (policies) {
      const isDefault = isDefaultContext(props.document.context);
    
      const isAdmin = policies?.get('layers').has('INSERT');

      // If this is the default context, and the user has
      // sufficient privileges to create layers, load all layers
      if (isDefault && isAdmin) {
        getAllLayersInProject(supabase, props.document.id, props.document.context.project_id)
          .then(({ data, error }) => {
            if (error)
              console.error(error);
            else
              setLayers(data);
          });
      } else {
        setLayers(props.document.layers);
      }
    }
  }, [policies]);

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
  
  const selectAction = (annotation: ImageAnnotation) => {
    // Annotation targets are editable for creators and admins
    const me = anno.current?.getUser()?.id;
    const canEdit = annotation.target.creator?.id === me ||
      policies?.get('layers').has('INSERT');

    return canEdit ? PointerSelectAction.EDIT : PointerSelectAction.HIGHLIGHT;
  }

  return (
    <div className="anno-desktop ia-desktop">
      <Annotorious ref={anno}>
        {policies && (
          <OpenSeadragonAnnotator 
            adapter={null}
            pointerSelectAction={selectAction}
            tool={tool} 
            keepEnabled={true}
            formatter={formatter}>
          
            <AnnotationDesktop.UndoStack 
              undoEmpty={true} />

            {layers && 
              <SupabasePlugin
                base={SUPABASE}
                apiKey={SUPABASE_API_KEY} 
                channel={props.channelId}
                defaultLayer={props.document.layers[0].id} 
                layerIds={layers.map(layer => layer.id)}
                appearanceProvider={appearance}
                onPresence={setPresent} 
                onConnectError={onConnectError}
                privacyMode={privacy === 'PRIVATE'} />
            }

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
                    policies={policies}
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
                policies={policies}
                layers={layers}
                onChangePanel={onChangeViewMenuPanel} 
                onChangeFormatter={f => setFormatter(() => f)}
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
        )}
      </Annotorious>
    </div>
  )

}