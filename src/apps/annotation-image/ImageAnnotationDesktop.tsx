import { useEffect, useMemo, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { getAllDocumentLayersInProject, isDefaultContext } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { Annotation } from '@components/Annotation';
import { BrandFooter, BrandHeader } from '@components/Branding';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { createAppearenceProvider, PresenceStack } from '@components/Presence';
import { AnnotationDesktop, ViewMenuPanel } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import type { Layer } from 'src/Types';
import { Toolpanel } from './Toolpanel';
import type { ImageAnnotationProps } from './ImageAnnotation';
import { 
  Annotation as Anno,
  AnnotoriousOpenSeadragonAnnotator,
  DrawingStyle,
  ImageAnnotation, 
  OpenSeadragonAnnotator,
  OpenSeadragonPopup,
  OpenSeadragonViewer,
  PointerSelectAction,
  PresentUser,
  useAnnotator
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';
import { Menubar } from './Menubar/Menubar';

const SUPABASE: string = import.meta.env.PUBLIC_SUPABASE;
const SUPABASE_API_KEY: string = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export const ImageAnnotationDesktop = (props: ImageAnnotationProps) => {

  const { i18n } = props;

  // @ts-ignore
  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [loading, setLoading] = useState(true);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [tool, setTool] = useState<string>('rectangle');

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const [style, setStyle] = useState<((a: Anno) => DrawingStyle) | undefined>(undefined);

  const [filter, setFilter] = useState<((a: Anno) => boolean) | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [layers, setLayers] = useState<Layer[] | undefined>();

  // Default layer is either the first layer in the project context, 
  // or the first layer in the list, if no project context
  const defaultLayer = layers && layers.length > 0 ? 
    layers.find(l => !l.context.name) || layers[0] : undefined;

  const appearance = useMemo(() => createAppearenceProvider(), []);

  const vocabulary = useTagVocabulary(props.document.context.project_id);

  useEffect(() => {
    if (policies) {
      const isDefault = isDefaultContext(props.document.context);
    
      const isAdmin = policies?.get('layers').has('INSERT');

      // If this is the default context, and the user has
      // sufficient privileges to create layers, load all layers
      if (isDefault && isAdmin) {
        getAllDocumentLayersInProject(supabase, props.document.id, props.document.context.project_id)
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

  const onChangeTool = (tool: string | null) => {
    if (tool) {
      if (!drawingEnabled) setDrawingEnabled(true);
      setTool(tool);
    } else {
      setDrawingEnabled(false);
    }
  }

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
    if (a && !usePopup && anno) {
      // Don't fit the view if the annotation is already selected
      if (anno.state.selection.isSelected(a))
        return;

      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

      anno.fitBounds(a, { padding: [vh / 2, vw / 2 + 600, vh / 2, (vw  - 600) / 2] });
    }
  }
  
  const selectAction = (annotation: ImageAnnotation) => {
    // Annotation targets are editable for creators and admins
    const me = anno?.getUser()?.id;
    const canEdit = annotation.target.creator?.id === me ||
      policies?.get('layers').has('INSERT');

    return canEdit ? PointerSelectAction.EDIT : PointerSelectAction.SELECT;
  }

  // TODO since Annotorious 3.0.0-rc.2 this needs to be 
  // memo-ized which is a pain - need to fix this inside
  // Annotorious!
  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: props.document.meta_data?.url,
    gestureSettingsMouse: {
      clickToZoom: false
    },
    showNavigationControl: false,
    crossOriginPolicy: 'Anonymous'
  }), [props.document.meta_data?.url]);

  return (
    <div className="anno-desktop ia-desktop">
      {loading && (
        <LoadingOverlay />
      )}

      <div>
        <BrandHeader />
        
        <Menubar 
          i18n={i18n} 
          document={props.document} 
          present={present} />
      </div>

      <main>
        {policies && (
          <OpenSeadragonAnnotator
            autoSave
            drawingEnabled={drawingEnabled}
            pointerSelectAction={selectAction}
            tool={tool} 
            filter={filter}
            style={style}>
          
            <AnnotationDesktop.UndoStack 
              undoEmpty={true} />

            {layers && 
              <SupabasePlugin
                supabaseUrl={SUPABASE}
                apiKey={SUPABASE_API_KEY} 
                channel={props.channelId}
                defaultLayer={defaultLayer?.id} 
                layerIds={layers.map(layer => layer.id)}
                appearanceProvider={appearance}
                onInitialLoad={() => setLoading(false)}
                onPresence={setPresent} 
                onConnectError={onConnectError}
                privacyMode={privacy === 'PRIVATE'} />
            }

            <OpenSeadragonViewer
              className="ia-osd-container"
              options={options} />

            {usePopup && (
              <OpenSeadragonPopup
                popup ={props => (
                  <Annotation.Popup 
                    {...props} 
                    i18n={i18n}
                    policies={policies}
                    present={present} 
                    tagVocabulary={vocabulary} /> )} />
            )}

            {/* <div className="anno-desktop-left">
              <AnnotationDesktop.DocumentMenu
                i18n={props.i18n}
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
                defaultLayer={defaultLayer?.id} 
                channel={props.channelId}
                tagVocabulary={vocabulary}
                onChangePanel={onChangeViewMenuPanel} 
                onChangeAnnotationFilter={f => setFilter(() => f)}
                onChangeAnnotationStyle={s => setStyle(() => s)}
                beforeSelectAnnotation={beforeSelectAnnotation} />
            </div>
                */}


            <Toolpanel 
              i18n={props.i18n}
              isAdmin={policies?.get('layers').has('INSERT')}
              privacy={privacy}
              onChangeTool={onChangeTool} 
              onChangePrivacy={setPrivacy} />
          </OpenSeadragonAnnotator>
        )}
      </main>

      <div>
        <BrandFooter />
      </div>
    </div>
  )

}