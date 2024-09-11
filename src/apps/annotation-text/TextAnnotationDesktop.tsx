import { useEffect, useMemo, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { PresentUser, AnnotationState, Color } from '@annotorious/react';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { supabase } from '@backend/supabaseBrowserClient';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { DocumentNotes, useLayerNames } from '@components/AnnotationDesktop';
import { LoadingOverlay } from '@components/LoadingOverlay';
import type { PrivacyMode } from '@components/PrivacySelector';
import { TopBar } from '@components/TopBar';
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

export const TextAnnotationDesktop = (props: TextAnnotationProps) => {

  const contentType = props.document.content_type;

  const anno = useAnnotator<RecogitoTextAnnotator>();

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const [documentLayers, setDocumentLayers] = useState<DocumentLayer[] | undefined>();

  const [embeddedLayers, setEmbeddedLayers] = useState<EmbeddedLayer[] | undefined>();

  const layers = useMemo(() => (
    [...(documentLayers || []), ...(embeddedLayers || [])]
  ), [documentLayers, embeddedLayers]);

  const layerNames = useLayerNames(props.document, embeddedLayers);

  const activeLayer = useMemo(
    () =>
      documentLayers && documentLayers.length > 0
        ? documentLayers.find((l) => l.is_active) || documentLayers[0]
        : undefined,
    [documentLayers]
  );

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [activeLayerStyle, setActiveLayerStyle] = useState<
    HighlightStyleExpression | undefined
  >(undefined);

  const onChangeStyle = (style?: (a: SupabaseAnnotation) => Color) => {
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
  };

  const style: HighlightStyleExpression = useMemo(() => {
    // In practice, there should only ever be one active layer
    const activeLayers = 
      new Set((documentLayers || []).filter(l => l.is_active).map(l => l.id))

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

  useEffect(() => {
    // Need to rethink - we also want popups
    // when the panel shows Notes. But the design
    // may still change...
    setUsePopup(!rightPanelOpen);
  }, [rightPanelOpen]);

  const onRightTabChanged = (tab: 'ANNOTATIONS' | 'NOTES') =>
    setUsePopup(tab === 'NOTES');

  const beforeSelectAnnotation = (a?: TextAnnotation) => {
    if (a && !usePopup && anno) {
      // Don't scroll if the annotation is already selected
      if (anno.state.selection.isSelected(a)) return;
      anno.scrollIntoView(a);
    }
  };

  const sorting =
    props.document.content_type === 'application/pdf'
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

  return (
    <DocumentNotes
      channelId={props.channelId}
      layers={documentLayers}
      present={present}
      onError={() => setConnectionError(true)}>
      <div className="anno-desktop ta-desktop">
        {loading && <LoadingOverlay />}

        <div className="header">
          <TopBar
            i18n={props.i18n}
            invitations={[]}
            me={props.me}
            showNotifications={false}
            onError={() => {}} />

          <Toolbar
            i18n={props.i18n}
            document={props.document}
            present={present}
            privacy={privacy}
            layers={documentLayers}
            layerNames={layerNames}
            leftDrawerOpen={leftPanelOpen}
            policies={policies}
            rightDrawerOpen={rightPanelOpen}
            showConnectionError={connectionError}
            onChangePrivacy={setPrivacy}
            onChangeStyle={onChangeStyle}
            onToggleBranding={() => setShowBranding(!showBranding)}
            onToggleLeftDrawer={() => setLeftPanelOpen((open) => !open)}
            onToggleRightDrawer={() => setRightPanelOpen((open) => !open)} />
        </div>

        <main className={className}>
          <LeftDrawer
            i18n={props.i18n}
            layers={layers}
            layerNames={layerNames}
            open={leftPanelOpen}
            present={present}
          />

          {policies && (
            <AnnotatedText
              activeLayer={activeLayer}
              channelId={props.channelId}
              document={props.document}
              i18n={props.i18n}
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
              onLoadEmbeddedLayers={setEmbeddedLayers}
              styleSheet={props.styleSheet}
            />
          )}

          <RightDrawer
            i18n={props.i18n}
            layers={layers}
            layerNames={layerNames}
            open={rightPanelOpen}
            policies={policies}
            present={present}
            sorting={sorting}
            style={style}
            tagVocabulary={tagVocabulary}
            beforeSelectAnnotation={beforeSelectAnnotation}
            onTabChanged={onRightTabChanged} />
        </main>
      </div>
    </DocumentNotes>
  )

}
