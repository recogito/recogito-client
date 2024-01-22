import { useEffect, useState } from 'react';
import { getAllDocumentLayersInProject, isDefaultContext } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { BrandFooter, BrandHeader } from '@components/Branding';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { ColorState, DocumentNotes, FilterState, RightDrawer, RightDrawerPanel } from '@components/AnnotationDesktop';
import type { Layer } from 'src/Types';
import { AnnotatedImage } from './AnnotatedImage';
import type { ImageAnnotationProps } from './ImageAnnotation';
import { Menubar } from './Menubar';
import { 
  AnnotoriousOpenSeadragonAnnotator,
  DrawingStyle,
  ImageAnnotation, 
  PresentUser,
  useAnnotator
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';

export const ImageAnnotationDesktop = (props: ImageAnnotationProps) => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [loading, setLoading] = useState(true);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [rightPanel, setRightPanel] = useState<RightDrawerPanel | undefined>();

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const [style, setStyle] = useState<((a: ImageAnnotation) => DrawingStyle) | undefined>(undefined);

  const [filter, setFilter] = useState<((a: ImageAnnotation) => boolean) | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  const [layers, setLayers] = useState<Layer[] | undefined>();

  // Default layer is either the first layer in the project context, 
  // or the first layer in the list, if no project context
  const defaultLayer = layers && layers.length > 0 ? 
    layers.find(l => !l.context.name) || layers[0] : undefined;

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

  const onSetRightPanel = (panel?: RightDrawerPanel) => {
    if (panel === RightDrawerPanel.ANNOTATIONS) {
      // Don't use the popup if the annotation list is open
      setUsePopup(false);
    } else {
      if (!usePopup)
        setUsePopup(true)
    }

    setRightPanel(panel);
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

  const onError = (error: Error) => {
    console.error(error);
    // TODO UI feedback
  }

  return (
    <FilterState present={present}>
      <ColorState present={present}>
        <DocumentNotes
          channelId={props.channelId}
          layerId={defaultLayer?.id}
          present={present}
          onError={onError}>  

          <div className="anno-desktop ia-desktop">
            {loading && (
              <LoadingOverlay />
            )}

            <div className="header">
              <BrandHeader />
              
              <Menubar 
                i18n={props.i18n} 
                document={props.document} 
                present={present} 
                rightPanel={rightPanel}
                onSetRightDrawer={setRightPanel} />
            </div>

            <main>
              <div className="ia-drawer ia-drawer-left" />

              <div className="ia-annotated-image-container">
                {policies && (
                  <AnnotatedImage
                    channelId={props.channelId}
                    defaultLayer={defaultLayer}
                    document={props.document}
                    filter={filter}
                    i18n={props.i18n}
                    layers={layers}
                    policies={policies}
                    present={present}
                    style={style}        
                    tagVocabulary={tagVocabulary}
                    usePopup={usePopup}
                    onChangePresent={setPresent}
                    onConnectError={onConnectError}
                    onLoad={() => setLoading(false)} />
                )}
              </div>

              <RightDrawer 
                currentPanel={rightPanel}
                i18n={props.i18n}
                layers={layers}
                policies={policies}
                present={present}
                tagVocabulary={tagVocabulary}
                beforeSelectAnnotation={beforeSelectAnnotation}
                onChangeAnnotationFilter={setFilter}
                onChangeAnnotationStyle={setStyle} />
            </main>

            <div className="footer">
              <BrandFooter />
            </div>
          </div>
        </DocumentNotes>
      </ColorState>
    </FilterState>
  )

}