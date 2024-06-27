import { useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { supabase } from '@backend/supabaseBrowserClient';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { DocumentNotes, useLayerNames } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { TopBar } from '@components/TopBar';
import type { DocumentLayer } from 'src/Types';
import { AnnotatedImage } from './AnnotatedImage';
import type { ImageAnnotationProps } from './ImageAnnotation';
import { LeftDrawer } from './LeftDrawer';
import { RightDrawer } from './RightDrawer';
import { Toolbar } from './Toolbar';
import { useIIIF, ManifestErrorDialog } from './IIIF';
import { useAnnotator } from '@annotorious/react';
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
    isPresentationManifest,
    manifestError,
    sequence,
    currentImage,
    setCurrentImage
  } = useIIIF(props.document);

  const [layers, setLayers] = useState<DocumentLayer[] | undefined>();

  const layerNames = useLayerNames(props.document);

  const activeLayer = useMemo(
    () =>
      layers && layers.length > 0
        ? layers.find((l) => l.is_active) || layers[0]
        : undefined,
    [layers]
  );

  const [tool, setTool] = useState<string | undefined>();

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [activeLayerStyle, setActiveLayerStyle] = useState<
    DrawingStyleExpression<ImageAnnotation>
  >(() => DEFAULT_STYLE);

  const onChangeStyle = (style?: (a: SupabaseAnnotation) => Color) => {
    if (style) {
      const hse: DrawingStyleExpression<ImageAnnotation> = (
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

      setActiveLayerStyle(() => hse);
    } else {
      setActiveLayerStyle(() => DEFAULT_STYLE);
    }
  };

  // @ts-ignore - note: minor type issue, will be fixed with next Annotorious release
  const style: DrawingStyleExpression<ImageAnnotation> = useMemo(() => {
    const readOnly = new Set(
      (layers || []).filter((l) => !l.is_active).map((l) => l.id)
    );

    const readOnlyStyle = (state?: AnnotationState) => ({
      fill: '#010101',
      fillOpacity: state?.hovered ? 0.1 : 0,
      stroke: '#010101',
      strokeOpacity: state?.selected ? 1 : 0.65,
      strokeWidth: state?.selected ? 2.5 : 2,
    });

    return (annotation: ImageAnnotation, state?: AnnotationState) => {
      const a = annotation as SupabaseAnnotation;
      return a.layer_id && readOnly.has(a.layer_id)
        ? readOnlyStyle(state)
        : typeof activeLayerStyle === 'function'
        ? activeLayerStyle(a as ImageAnnotation, state)
        : activeLayerStyle;
    };
  }, [activeLayerStyle, layers]);

  const [usePopup, setUsePopup] = useState(true);

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

          setLayers([...props.document.layers, ...toAdd]);
        });
      } else {
        setLayers(props.document.layers);
      }
    }
  }, [policies]);

  const onZoom = (factor: number) => 
    viewer.current?.viewport.zoomBy(factor);

  useEffect(() => {
    // Need to rethink - we also want popups
    // when the panel shows Notes. But the design
    // may still change...
    setUsePopup(!rightPanelOpen);
  }, [rightPanelOpen]);

  const onRightTabChanged = (tab: 'ANNOTATIONS' | 'NOTES') =>
    setUsePopup(tab === 'NOTES');

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

  return (
    <DocumentNotes
      channelId={props.channelId}
      layers={layers}
      present={present}
      onError={() => setConnectionError(true)}>

      <div className="anno-desktop ia-desktop">
        <TopBar
          i18n={props.i18n}
          invitations={[]}
          me={props.me}
          projects={[]}
          showNotifications={false}
          onError={() => setConnectionError(true)} />

        {loading && <LoadingOverlay />}

        <div className="header">
          <Toolbar
            i18n={props.i18n}
            document={props.document}
            present={present}
            privacy={privacy}
            layers={layers}
            layerNames={layerNames}
            leftDrawerOpen={leftPanelOpen}
            policies={policies}
            rightDrawerOpen={rightPanelOpen}
            showConnectionError={connectionError}
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
            currentImage={currentImage}
            i18n={props.i18n}
            iiifSequence={sequence}
            layers={layers}
            layerNames={layerNames}
            open={leftPanelOpen}
            present={present}
            onChangeImage={setCurrentImage} />

          <div className="ia-annotated-image-container">
            {policies && currentImage && (
              <AnnotatedImage
                ref={viewer}
                activeLayer={activeLayer}
                authToken={authToken}
                channelId={props.channelId}
                i18n={props.i18n}
                imageManifestURL={currentImage}
                isPresentationManifest={isPresentationManifest}
                layers={layers}
                layerNames={layerNames}
                policies={policies}
                present={present}
                privacy={privacy}
                style={style}
                tagVocabulary={tagVocabulary}
                tool={tool}
                usePopup={usePopup}
                onChangePresent={setPresent}
                onConnectionError={() => setConnectionError(true)}
                onSaveError={() => setConnectionError(true)}
                onLoad={() => setLoading(false)} />
            )}
          </div>

          <RightDrawer
            i18n={props.i18n}
            layers={layers}
            layerNames={layerNames}
            open={rightPanelOpen}
            policies={policies}
            present={present}
            style={style}
            tagVocabulary={tagVocabulary}
            beforeSelectAnnotation={beforeSelectAnnotation}
            onTabChanged={onRightTabChanged}
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
