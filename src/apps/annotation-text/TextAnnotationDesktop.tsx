import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { PresentUser, AnnotationState, Color } from '@annotorious/react';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { supabase } from '@backend/supabaseBrowserClient';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import {
  type DocumentNote,
  DocumentNotes,
  useAnnotationsViewUIState,
  useLayerNames,
} from '@components/AnnotationDesktop';
import { LoadingOverlay } from '@components/LoadingOverlay';
import type { PrivacyMode } from '@components/PrivacySelector';
import { TopBar } from '@components/TopBar';
import { type Document, type DocumentWithContext } from 'src/Types';
import type { TextAnnotationProps } from './TextAnnotation';
import { Toolbar } from './Toolbar';
import { AnnotatedText } from './AnnotatedText';
import { LeftDrawer } from './LeftDrawer/LeftDrawer';
import { RightDrawer } from './RightDrawer';
import type { DocumentLayer, EmbeddedLayer } from 'src/Types';
import { deduplicateLayers } from 'src/util/deduplicateLayers';
import type {
  HighlightStyle,
  HighlightStyleExpression,
  RecogitoTextAnnotator,
  TextAnnotation,
} from '@recogito/react-text-annotator';

import './TextAnnotationDesktop.css';
import '@recogito/react-text-annotator/react-text-annotator.css';
import { useTranslation } from 'react-i18next';

export const TextAnnotationDesktop = (props: TextAnnotationProps) => {
  const [document, setDocument] = useState<DocumentWithContext>(props.document);

  // @ts-ignore
  const isLocked = document.project_is_locked;

  const contentType = document.content_type;

  const anno = useAnnotator<RecogitoTextAnnotator>();

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const policies = useLayerPolicies(document.layers[0].id);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const tagVocabulary = useTagVocabulary(document.context.project_id);

  const [documentLayers, setDocumentLayers] = useState<
    DocumentLayer[] | undefined
  >();

  const [embeddedLayers, setEmbeddedLayers] = useState<
    EmbeddedLayer[] | undefined
  >();

  const [embeddedNotes, setEmbeddedNotes] = useState<
    DocumentNote[] | undefined
  >();

  const [toast, setToast] = useState<ToastContent | undefined>();

  const layers = useMemo(
    () => [...(documentLayers || []), ...(embeddedLayers || [])],
    [documentLayers, embeddedLayers]
  );

  const layerNames = useLayerNames(document, embeddedLayers);

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

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const {
    rightPanelOpen,
    rightPanelTab,
    setRightPanelOpen,
    setRightPanelTab,
    usePopup,
  } = useAnnotationsViewUIState();

  const { t } = useTranslation(['project-assignments']);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [activeLayerStyle, setActiveLayerStyle] = useState<
    HighlightStyleExpression | undefined
  >(undefined);

  const onChangeStyle = useCallback(
    (style?: (a: SupabaseAnnotation) => Color) => {
      if (style) {
        const hse: HighlightStyleExpression = (
          a: SupabaseAnnotation,
          state?: AnnotationState
        ) => ({
          fill: style(a),
          fillOpacity: state?.selected ? 0.5 : 0.24,
        });

        setActiveLayerStyle(() => hse);
      } else {
        setActiveLayerStyle(undefined);
      }
    },
    [setActiveLayerStyle]
  );

  const style: HighlightStyleExpression = useMemo(() => {
    // In practice, there should only ever be one active layer
    const activeLayers = new Set(
      (documentLayers || []).filter((l) => l.is_active).map((l) => l.id)
    );

    const readOnlyStyle = (state?: AnnotationState, z?: number) =>
      ({
        fill: state?.selected ? '#000000' : undefined,
        fillOpacity: state?.selected ? 0.08 : 0,
        underlineStyle: 'solid',
        underlineColor: '#000000' as Color,
        underlineOffset: (z || 0) * 3,
        underlineThickness: 2,
      } as HighlightStyle);

    return (a: SupabaseAnnotation, state: AnnotationState, z?: number) =>
      a.layer_id && !activeLayers.has(a.layer_id)
        ? readOnlyStyle(state, z)
        : typeof activeLayerStyle === 'function'
        ? activeLayerStyle(a, state, z)
        : activeLayerStyle;
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

  const onRightTabChanged = (tab: 'ANNOTATIONS' | 'NOTES') =>
    setRightPanelTab(tab);

  const onNavigateTo = (annotation: SupabaseAnnotation) => {
    anno.state.selection.setSelected(annotation.id);
    anno.scrollIntoView(annotation.id);
  };

  const beforeSelectAnnotation = (a?: TextAnnotation) => {
    if (a && !usePopup && anno) {
      // Don't scroll if the annotation is already selected
      if (anno.state.selection.isSelected(a)) return;
      anno.scrollIntoView(a);
    }
  };

  const sorting =
    document.content_type === 'application/pdf'
      ? (a: PDFAnnotation, b: PDFAnnotation) => {
          const pages =
            a.target.selector[0]?.pageNumber - b.target.selector[0]?.pageNumber;
          return pages === 0
            ? a.target.selector[0]?.start - b.target.selector[0]?.start
            : pages;
        }
      : (a: TextAnnotation, b: TextAnnotation) =>
          a.target.selector[0].start - b.target.selector[0].start;

  const className = [
    'ta-annotated-text-container',
    contentType === 'text/xml'
      ? 'tei'
      : contentType === 'application/pdf'
      ? 'pdf'
      : 'text',
    rightPanelOpen ? 'list-open' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const onLoadEmbeddedLayers = useCallback(
    (layers: EmbeddedLayer[], notes: DocumentNote[]) => {
      setEmbeddedLayers(layers);
      setEmbeddedNotes(notes);
    },
    []
  );

  const onError = (error: string) =>
    setToast({
      title: t('Something went wrong', { ns: 'project-assignments' }),
      description: error,
      type: 'error',
    });

  const onUpdated = (doc: Document) =>
    setDocument((prevDocument) => ({
      ...prevDocument,
      name: doc.name,
      meta_data: doc.meta_data,
    }));

  return (
    <ToastProvider>
      <DocumentNotes
        channelId={props.channelId}
        embeddedNotes={embeddedNotes}
        layers={layers}
        present={present}
        onError={() => setConnectionError(true)}
      >
        <div className='anno-desktop ta-desktop'>
          {loading && <LoadingOverlay />}

          <div className='header'>
            <TopBar me={props.me} onError={() => {}} />

            <Toolbar
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
              onChangePrivacy={setPrivacy}
              onChangeStyle={onChangeStyle}
              onToggleBranding={() => setShowBranding(!showBranding)}
              onToggleLeftDrawer={() => setLeftPanelOpen((open) => !open)}
              onToggleRightDrawer={() => setRightPanelOpen((open) => !open)}
            />
          </div>

          <main className={className}>
            <LeftDrawer
              document={document}
              layers={layers}
              layerNames={layerNames}
              me={props.me}
              onError={onError}
              onUpdated={onUpdated}
              open={leftPanelOpen}
              present={present}
            />

            {policies && (
              <AnnotatedText
                activeLayer={activeLayer}
                channelId={props.channelId}
                document={document}
                isLocked={isLocked}
                layers={documentLayers}
                layerNames={layerNames}
                policies={policies}
                present={present}
                privacy={privacy}
                style={style}
                tagVocabulary={tagVocabulary}
                usePopup={usePopup}
                onChangePresent={setPresent}
                onConnectionError={() => setConnectionError(true)}
                onSaveError={() => setConnectionError(true)}
                onLoad={() => setLoading(false)}
                onLoadEmbeddedLayers={onLoadEmbeddedLayers}
                onNavigateTo={onNavigateTo}
                styleSheet={props.styleSheet}
              />
            )}

            <RightDrawer
              isProjectLocked={isLocked}
              layers={layers}
              layerNames={layerNames}
              open={rightPanelOpen}
              policies={policies}
              present={present}
              sorting={sorting}
              style={style}
              tagVocabulary={tagVocabulary}
              beforeSelectAnnotation={beforeSelectAnnotation}
              onNavigateTo={onNavigateTo}
              onTabChanged={onRightTabChanged}
              tab={rightPanelTab}
            />
          </main>
        </div>
      </DocumentNotes>

      <Toast
        content={toast}
        onOpenChange={(open) => !open && setToast(undefined)}
      />
    </ToastProvider>
  );
};
