import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { useAnnotator } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { LoadingOverlay } from '@components/LoadingOverlay';
import {
  clearSelectionURLHash,
  DocumentNotes,
  useAnnotationsViewUIState,
  useLayerNames,
} from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { TopBar } from '@components/TopBar';
import { AnnotatedImage } from './AnnotatedImage';
import type { ImageAnnotationProps } from './ImageAnnotation';
import { LeftDrawer } from './LeftDrawer';
import { RightDrawer } from './RightDrawer';
import { Toolbar } from './Toolbar';
import { useIIIF, useMultiPagePresence, ManifestErrorDialog, type IIIFImage } from './IIIF';
import { deduplicateLayers } from 'src/util/deduplicateLayers';
import type { Document, DocumentLayer } from 'src/Types';
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
  strokeWidth: state?.selected ? 2 : 1,
});

export const ImageAnnotationDesktop = (props: ImageAnnotationProps) => {
  const [document, setDocument] = useState(props.document);

  // @ts-ignore
  const isLocked = document.project_is_locked;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const policies = useLayerPolicies(document.layers[0].id);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [toast, setToast] = useState<ToastContent | null>(null);

  const tagVocabulary = useTagVocabulary(document.context.project_id);

  const viewer = useRef<OpenSeadragon.Viewer>(null);

  const {
    authToken,
    canvases,
    isPresentationManifest,
    manifestError,
    metadata,
    embeddedAnnotations,
    currentImage,
    setCurrentImage,
  } = useIIIF(document);

  const { activeUsers, onPageActivity } = useMultiPagePresence(present);

  const [documentLayers, setDocumentLayers] = useState<
    DocumentLayer[] | undefined
  >();

  const embeddedLayers = useMemo(() => {
    if (embeddedAnnotations?.layer) return [embeddedAnnotations.layer];
  }, [embeddedAnnotations]);

  const layers = useMemo(
    () => [...(documentLayers || []), ...(embeddedLayers || [])],
    [documentLayers, embeddedLayers]
  );

  const layerNames = useLayerNames(document, embeddedLayers);

  const { t } = props.i18n;

  const activeLayer = useMemo(() => {
    // Waiting for layers to load
    if (!documentLayers) return;

    // Crash hard if there is no layer (the error boundary will handle the UI message!)
    if (documentLayers.length === 0) throw 'Fatal: document has no layers.';

    // Crash hard if there is no active layer
    const activeLayers = documentLayers.filter((l) => l.is_active);
    if (activeLayers.length === 0) throw 'Fatal: active layer missing.';

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
    usePopup,
  } = useAnnotationsViewUIState();

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [activeLayerStyle, setActiveLayerStyle] = useState<
    DrawingStyleExpression<ImageAnnotation>
  >(() => DEFAULT_STYLE);

  useEffect(() => {
    // The 'pages' sidebar should be open by default
    // in case of multi-page IIIF images
    if (canvases.length > 1) setLeftPanelOpen(true);
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
          strokeWidth: state?.selected ? 2 : 1,
        };
      };

      setActiveLayerStyle(() => dse);
    } else {
      setActiveLayerStyle(() => DEFAULT_STYLE);
    }
  };

  const style: DrawingStyleExpression<ImageAnnotation> = useMemo(() => {
    // In practice, there should only ever be one active layer
    const activeLayers = new Set(
      (documentLayers || []).filter((l) => l.is_active).map((l) => l.id)
    );

    const readOnlyStyle = (state?: AnnotationState) => ({
      fill: '#010101',
      fillOpacity: state?.hovered ? 0.1 : 0,
      stroke: '#010101',
      strokeOpacity: state?.selected ? 1 : 0.65,
      strokeWidth: state?.selected ? 2.5 : 2,
    });

    return ((a: SupabaseAnnotation, state?: AnnotationState) => {
      return a.layer_id && !activeLayers.has(a.layer_id)
        ? readOnlyStyle(state)
        : typeof activeLayerStyle === 'function'
          ? activeLayerStyle(a as ImageAnnotation, state)
          : activeLayerStyle;
    }) as DrawingStyleExpression;
  }, [activeLayerStyle, documentLayers]);

  useEffect(() => {
    if (policies) {
      const isDefault = document.context.is_project_default;

      const isAdmin = policies?.get('layers').has('INSERT');

      // If this is the default context, and the user has
      // sufficient privileges to create layers, load all layers
      if (isDefault && isAdmin) {
        getAllDocumentLayersInProject(
          supabase,
          document.id,
          document.context.project_id
        ).then(({ data, error }) => {
          if (error) console.error(error);

          const current = new Set(document.layers.map((l) => l.id));

          const toAdd: DocumentLayer[] = data
            .filter((l) => !current.has(l.id))
            .map((l) => ({
              id: l.id,
              is_active: false,
              document_id: l.document_id,
              project_id: document.context.project_id,
            }));

          setDocumentLayers([...document.layers, ...toAdd]);
        });
      } else {
        const distinct = deduplicateLayers(document.layers);

        if (document.layers.length !== distinct.length)
          console.warn('Layers contain duplicates', document.layers);

        setDocumentLayers(distinct);
      }
    }
  }, [policies]);

  const onZoom = (factor: number) => viewer.current?.viewport.zoomBy(factor);

  const onRightTabChanged = (tab: 'ANNOTATIONS' | 'NOTES') =>
    setRightPanelTab(tab);

  const onNavigateTo = (annotation: SupabaseAnnotation) => {
    const vw = Math.max(
      window.document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );

    const vh = Math.max(
      window.document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    anno.fitBounds(annotation, {
      padding: [vh / 2, vw / 2 + 600, vh / 2, (vw - 600) / 2],
    });

    anno.state.selection.setSelected(annotation.id);
  }

  const beforeSelectAnnotation = (a?: ImageAnnotation) => {
    if (a && !usePopup && anno) {
      // Don't fit the view if the annotation is already selected
      if (anno.state.selection.isSelected(a)) return;

      onNavigateTo(a);
    }
  };

  const onGoToImage = (source: IIIFImage | string, clearSelection = false) => {
    // When navigating via the thumbnail strip, clear the selection from the
    // hash, otherwise we'll get looped right back.
    if (clearSelection)
      clearSelectionURLHash();

    if (typeof source === 'string') {
      const canvas = canvases.find(c => c.uri === source);
      setCurrentImage(canvas || source);
    } else {
      setCurrentImage(source);
    }
  };



  const onError = (error: string) =>
    setToast({
      title: t['Something went wrong'],
      description: error,
      type: 'error',
    });

  const onUpdated = (doc: Document) => {
    setDocument((prevDocument) => ({
      ...prevDocument,
      name: doc.name,
      meta_data: doc.meta_data,
    }));
  };

  return (
    <ToastProvider>
      <DocumentNotes
        channelId={props.channelId}
        layers={documentLayers}
        present={present}
        onError={() => setConnectionError(true)}
      >
        <div className='anno-desktop ia-desktop'>
          <TopBar
            i18n={props.i18n}
            invitations={[]}
            me={props.me}
            showNotifications={false}
            onError={() => setConnectionError(true)}
          />

          {loading && <LoadingOverlay />}

          <div className='header'>
            <Toolbar
              i18n={props.i18n}
              isLocked={isLocked}
              document={document}
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
              onToggleLeftDrawer={() => setLeftPanelOpen((open) => !open)}
              onToggleRightDrawer={() => setRightPanelOpen((open) => !open)}
              onZoom={onZoom}
            />
          </div>

          <main>
            <LeftDrawer
              activeUsers={activeUsers}
              currentImage={currentImage}
              document={document}
              i18n={props.i18n}
              iiifCanvases={canvases}
              layers={layers}
              layerNames={layerNames}
              me={props.me}
              metadata={metadata}
              open={leftPanelOpen}
              present={present}
              onChangeImage={source => onGoToImage(source, true)}
              onError={onError}
              onUpdated={onUpdated}
            />

            <div className='ia-annotated-image-container'>
              {policies && currentImage && activeLayer && (
                <AnnotatedImage
                  ref={viewer}
                  activeLayer={activeLayer}
                  authToken={authToken}
                  channelId={props.channelId}
                  embeddedAnnotations={embeddedAnnotations?.annotations}
                  i18n={props.i18n}
                  currentImage={currentImage}
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
                  onChangeImage={source => onGoToImage(source, false)}
                  onChangePresent={setPresent}
                  onConnectionError={() => setConnectionError(true)}
                  onNavigateTo={onNavigateTo}
                  onPageActivity={
                    canvases.length > 1 ? onPageActivity : undefined
                  }
                  onSaveError={() => setConnectionError(true)}
                  onLoad={() => setLoading(false)}
                />
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
              onNavigateTo={onNavigateTo}
            />
          </main>
        </div>

        {manifestError && (
          <ManifestErrorDialog
            document={document}
            i18n={props.i18n}
            message={manifestError}
          />
        )}
      </DocumentNotes>

      <Toast content={toast} onOpenChange={(open) => !open && setToast(null)} />
    </ToastProvider>
  );
};
