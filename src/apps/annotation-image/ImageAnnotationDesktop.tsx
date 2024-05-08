import { useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { BrandFooter, BrandHeader } from '@components/Branding';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { ColorState, DocumentNotes, FilterState, DrawerPanel } from '@components/AnnotationDesktop';
import type { Layer } from 'src/Types';
import { AnnotatedImage } from './AnnotatedImage';
import type { ImageAnnotationProps } from './ImageAnnotation';
import { Menubar } from './Menubar';
import { LeftDrawer } from './LeftDrawer';
import { RightDrawer } from './RightDrawer';
import { useIIIF, ManifestErrorDialog } from './IIIF';
import {
  AnnotationState,
  AnnotoriousOpenSeadragonAnnotator,
  DrawingStyle,
  ImageAnnotation,
  PresentUser,
  useAnnotator
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';

export const ImageAnnotationDesktop = (props: ImageAnnotationProps) => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const viewer = useRef<OpenSeadragon.Viewer>(null);

  const policies = useLayerPolicies(props.document.layers[0].id);

  const {
    authToken,
    isPresentationManifest, 
    manifestError,
    sequence,
    currentImage,
    setCurrentImage
  } = useIIIF(props.document);

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [leftPanel, setLeftPanel] = useState<DrawerPanel | undefined>();

  const [rightPanel, setRightPanel] = useState<DrawerPanel | undefined>();

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const [layers, setLayers] = useState<Layer[] | undefined>();

  const [defaultLayerStyle, setDefaultLayerStyle] =
   useState<((a: ImageAnnotation, state: AnnotationState) => DrawingStyle) | undefined>(undefined);

  const style = useMemo(() => {
    const readOnly = new Set((layers || []).filter(l => !l.is_active).map(l => l.id));

    const readOnlyStyle: DrawingStyle = {
      fillOpacity: 0,
      stroke: '#010101',
      strokeOpacity: 1,
      strokeWidth: 2
    };

    return (a: SupabaseAnnotation, state: AnnotationState) =>
      (a.layer_id && readOnly.has(a.layer_id)) ? readOnlyStyle : 
      defaultLayerStyle ? defaultLayerStyle(a as ImageAnnotation, state) : undefined;
  }, [defaultLayerStyle, layers]);

  const [filter, setFilter] = useState<((a: ImageAnnotation) => boolean) | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  const defaultLayer =
    layers && layers.length > 0
      ? layers.find((l) => l.is_active_layer) || layers[0]
      : undefined;

  useEffect(() => {
    if (policies) {
      const isDefault = props.document.context.is_project_default;

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

  const onZoom = (factor: number) =>
    viewer.current?.viewport.zoomBy(factor);

  const onSetRightPanel = (panel?: DrawerPanel) => {
    if (panel === DrawerPanel.ANNOTATIONS)
      setUsePopup(false); // Don't use the popup if annotation list is open
    else if (!usePopup)
      setUsePopup(true);

    setRightPanel(panel);
  }

  const beforeSelectAnnotation = (a?: ImageAnnotation) => {
    if (a && !usePopup && anno) {
      // Don't fit the view if the annotation is already selected
      if (anno.state.selection.isSelected(a))
        return;

      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

      anno.fitBounds(a, { padding: [vh / 2, vw / 2 + 600, vh / 2, (vw - 600) / 2] });
    }
  }

  return (
    <FilterState present={present}>
      <ColorState present={present}>
        <DocumentNotes
          channelId={props.channelId}
          layerId={defaultLayer?.id}
          present={present}
          onError={() => setConnectionError(true)}>

          <div className="anno-desktop ia-desktop">
            {loading && (
              <LoadingOverlay />
            )}

            <div className="header">
              {showBranding && (
                <BrandHeader />
              )}

              <Menubar
                i18n={props.i18n}
                document={props.document}
                present={present}
                leftPanel={leftPanel}
                rightPanel={rightPanel}
                onZoom={onZoom}
                onToggleBranding={() => setShowBranding(!showBranding)}
                onSetLeftDrawer={setLeftPanel}
                onSetRightDrawer={onSetRightPanel}
                showConnectionError={connectionError} />
            </div>

            <main>
              <LeftDrawer
                currentImage={currentImage}
                currentPanel={leftPanel}
                iiifSequence={sequence}
                onChangeImage={setCurrentImage} />

              <div className="ia-annotated-image-container">
                {policies && currentImage && (
                  <AnnotatedImage
                    ref={viewer}
                    authToken={authToken}
                    channelId={props.channelId}
                    defaultLayer={defaultLayer}
                    imageManifestURL={currentImage}
                    isPresentationManifest={isPresentationManifest}
                    filter={filter}
                    i18n={props.i18n}
                    layers={layers}
                    policies={policies}
                    present={present}
                    style={style}
                    tagVocabulary={tagVocabulary}
                    usePopup={usePopup}
                    onChangePresent={setPresent}
                    onConnectionError={() => setConnectionError(true)}
                    onSaveError={() => setConnectionError(true)}
                    onLoad={() => setLoading(false)} />
                )}
              </div>

              <RightDrawer
                currentPanel={rightPanel}
                i18n={props.i18n}
                layers={layers}
                policies={policies}
                present={present}
                style={style}
                tagVocabulary={tagVocabulary}
                beforeSelectAnnotation={beforeSelectAnnotation}
                onChangeAnnotationFilter={f => setFilter(() => f)}
                onChangeAnnotationStyle={s => setDefaultLayerStyle(() => s)} />
            </main>

            {showBranding && (
              <div className="footer">
                <BrandFooter />
              </div>
            )}
          </div>

          {manifestError && (
            <ManifestErrorDialog
              document={props.document}
              i18n={props.i18n}
              message={manifestError} />
          )}
        </DocumentNotes>
      </ColorState>
    </FilterState>
  )

}