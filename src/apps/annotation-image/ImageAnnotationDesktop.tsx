import { useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { useAnnotator } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { clearSelectionURLHash, DocumentNotes, useAnnotationsViewUIState, useLayerNames } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { TopBar } from '@components/TopBar';
import { AnnotatedImage } from './AnnotatedImage';
import type { ImageAnnotationProps } from './ImageAnnotation';
import { LeftDrawer } from './LeftDrawer';
import { RightDrawer } from './RightDrawer';
import { Toolbar } from './Toolbar';
import { useIIIF, useMultiPagePresence, ManifestErrorDialog } from './IIIF';
import { deduplicateLayers } from 'src/util/deduplicateLayers';
import type { DocumentLayer } from 'src/Types';
import type {
  AnnotationState,
  AnnotoriousOpenSeadragonAnnotator,
  Color,
  DrawingStyleExpression,
  ImageAnnotation,
  PresentUser,
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';

const DEFAULT_STYLE: DrawingStyleExpression<ImageAnnotation> = (
  _: ImageAnnotation,
  state?: AnnotationState
) => ({
  fill: '#0080ff',
  fillOpacity: state?.hovered ? 0.28 : 0.2,
  stroke: '#0080ff',
  strokeOpacity: state?.selected ? 0.9 : 0.5,
  strokeWidth: state?.selected ? 2 : 1
});

export const ImageAnnotationDesktop = (props: ImageAnnotationProps) => {

  // @ts-ignore
  const isLocked = props.document.project_is_locked;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const viewer = useRef<OpenSeadragon.Viewer>(null);

  const {
    authToken,
    canvases,
    isPresentationManifest,
    manifestError,
    currentImage,
    setCurrentImage
  } = useIIIF(props.document);

  const { activeUsers, onPageActivity } = useMultiPagePresence(present);

  const [documentLayers, setDocumentLayers] = useState<DocumentLayer[] | undefined>();

  const layerNames = useLayerNames(props.document);

  const activeLayer = useMemo(() => {
    // Waiting for layers to load
    if (!documentLayers) return;

    // Crash hard if there is no layer (the error boundary will handle the UI message!)
    if (documentLayers.length === 0)
      throw 'Fatal: document has no layers.';

    // Crash hard if there is no active layer
    const activeLayers = documentLayers.filter(l => l.is_active);
    if (activeLayers.length === 0)
      throw 'Fatal: active layer missing.';

    // Crash hard if there is more than one active layer
    if (activeLayers.length > 1) {
      console.error(activeLayers);
      throw `Fatal: more than one active layer (found ${activeLayers.length})`;
    }

    return activeLayers[0];
  }, [documentLayers]);

  const [tool, setTool] = useState<string | undefined>();

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const {
    rightPanelOpen,
    rightPanelTab,
    setRightPanelOpen,
    setRightPanelTab,
    usePopup
  } = useAnnotationsViewUIState();

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [activeLayerStyle, setActiveLayerStyle] = useState<
    DrawingStyleExpression<ImageAnnotation>
  >(() => DEFAULT_STYLE);

  useEffect(() => {
    // The 'pages' sidebar should be open by default
    // in case of multi-page IIIF images
    if (canvases.length > 1)
      setLeftPanelOpen(true);
  }, [canvases]);

  const onChangeStyle = (style?: (a: SupabaseAnnotation) => Color) => {
    if (style) {
      const dse: DrawingStyleExpression<ImageAnnotation> = (
        a: SupabaseAnnotation,
        state?: AnnotationState
      ) => {
        const color = style(a);

        return {
          fill: color,
          fillOpacity: state?.hovered ? 0.28 : 0.2,
          stroke: color,
          strokeOpacity: state?.selected ? 0.9 : 0.5,
          strokeWidth: state?.selected ? 2 : 1
        };
      };

      setActiveLayerStyle(() => dse);
    } else {
      setActiveLayerStyle(() => DEFAULT_STYLE);
    }
  };

  const style: DrawingStyleExpression<ImageAnnotation> = useMemo(() => {
    const readOnly = new Set(
      (documentLayers || []).filter((l) => !l.is_active).map((l) => l.id)
    );

    const readOnlyStyle = (state?: AnnotationState) => ({
      fill: '#010101',
      fillOpacity: state?.hovered ? 0.1 : 0,
      stroke: '#010101',
      strokeOpacity: state?.selected ? 1 : 0.65,
      strokeWidth: state?.selected ? 2.5 : 2,
    });

    return ((annotation: ImageAnnotation, state?: AnnotationState) => {
      const a = annotation as SupabaseAnnotation;
      return a.layer_id && readOnly.has(a.layer_id)
        ? readOnlyStyle(state)
        : typeof activeLayerStyle === 'function'
        ? activeLayerStyle(a as ImageAnnotation, state)
        : activeLayerStyle;
    }) as DrawingStyleExpression;
  }, [activeLayerStyle, documentLayers]);

  useEffect(() => {
    if (policies) {
      const isDefault = props.document.context.is_project_default;

      const isAdmin = policies?.get('layers').has('INSERT');

      // If this is the default context, and the user has
      // sufficient privileges to create layers, load all layers
      if (isDefault && isAdmin) {
        getAllDocumentLayersInProject(
          supabase,
          props.document.id,
          props.document.context.project_id
        ).then(({ data, error }) => {
          if (error) console.error(error);

          const current = new Set(props.document.layers.map((l) => l.id));

          const toAdd: DocumentLayer[] = data
            .filter((l) => !current.has(l.id))
            .map((l) => ({
              id: l.id,
              is_active: false,
              document_id: l.document_id,
              project_id: props.document.context.project_id
            }));

          setDocumentLayers([...props.document.layers, ...toAdd]);
        });
      } else {
        const distinct = deduplicateLayers(props.document.layers);

        if (props.document.layers.length !== distinct.length)
          console.warn('Layers contain duplicates', props.document.layers);

        setDocumentLayers(distinct);
      }
    }
  }, [policies]);

  const onZoom = (factor: number) => 
    viewer.current?.viewport.zoomBy(factor);

  const onRightTabChanged = (tab: 'ANNOTATIONS' | 'NOTES') => setRightPanelTab(tab);

  const beforeSelectAnnotation = (a?: ImageAnnotation) => {
    if (a && !usePopup && anno) {
      // Don't fit the view if the annotation is already selected
      if (anno.state.selection.isSelected(a)) return;

      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );

      anno.fitBounds(a, {
        padding: [vh / 2, vw / 2 + 600, vh / 2, (vw - 600) / 2],
      });
    }
  };

  const onGoToImage = (source: string) => {
    // When navigating via the thumbnail strip, clear the selection from the
    // hash, otherwise we'll get looped right back.
    clearSelectionURLHash(); 
    setCurrentImage(source);
  }

  return (
    <DocumentNotes
      channelId={props.channelId}
      layers={documentLayers}
      present={present}
      onError={() => setConnectionError(true)}>

      <div className="anno-desktop ia-desktop">
        <TopBar
          i18n={props.i18n}
          invitations={[]}
          me={props.me}
          showNotifications={false}
          onError={() => setConnectionError(true)} />

        {loading && <LoadingOverlay />}

        <div className="header">
          <Toolbar
            i18n={props.i18n}
            isLocked={isLocked}
            document={props.document}
            present={present}
            privacy={privacy}
            layers={documentLayers}
            layerNames={layerNames}
            leftDrawerOpen={leftPanelOpen}
            policies={policies}
            rightDrawerOpen={rightPanelOpen}
            showConnectionError={connectionError}
            tagVocabulary={tagVocabulary}
            tool={tool}
            onChangePrivacy={setPrivacy}
            onChangeStyle={onChangeStyle}
            onChangeTool={setTool}
            onToggleBranding={() => setShowBranding(!showBranding)}
            onToggleLeftDrawer={() => setLeftPanelOpen(open => !open)}
            onToggleRightDrawer={() => setRightPanelOpen(open => !open)}
            onZoom={onZoom}
          />
        </div>

        <main>
          <LeftDrawer
            activeUsers={activeUsers}
            currentImage={currentImage}
            i18n={props.i18n}
            iiifCanvases={canvases}
            layers={documentLayers}
            layerNames={layerNames}
            open={leftPanelOpen}
            present={present}
            onChangeImage={onGoToImage} />

          <div className="ia-annotated-image-container">
            {policies && currentImage && activeLayer && (
              <AnnotatedImage
                ref={viewer}
                activeLayer={activeLayer}
                authToken={authToken}
                channelId={props.channelId}
                i18n={props.i18n}
                imageManifestURL={currentImage}
                isLocked={isLocked}
                isPresentationManifest={isPresentationManifest}
                layers={documentLayers}
                layerNames={layerNames}
                policies={policies}
                present={present}
                privacy={privacy}
                style={style}
                tagVocabulary={tagVocabulary}
                tool={tool}
                usePopup={usePopup}
                onChangeImage={setCurrentImage}
                onChangePresent={setPresent}
                onConnectionError={() => setConnectionError(true)}
                onPageActivity={canvases.length > 1 ? onPageActivity : undefined}
                onSaveError={() => setConnectionError(true)}
                onLoad={() => setLoading(false)} />
            )}
          </div>

          <RightDrawer
            i18n={props.i18n}
            isLocked={isLocked}
            layers={documentLayers}
            layerNames={layerNames}
            open={rightPanelOpen}
            policies={policies}
            present={present}
            style={style}
            tagVocabulary={tagVocabulary}
            beforeSelectAnnotation={beforeSelectAnnotation}
            onTabChanged={onRightTabChanged}
            tab={rightPanelTab}
          />
        </main>
      </div>

      {manifestError && (
        <ManifestErrorDialog
          document={props.document}
          i18n={props.i18n}
          message={manifestError}
        />
      )}
    </DocumentNotes>
  )

}
