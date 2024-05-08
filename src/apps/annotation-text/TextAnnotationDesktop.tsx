import { useEffect, useMemo, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import { animated, easings, useSpring } from '@react-spring/web';
import type { PresentUser, Filter, AnnotationState, Color } from '@annotorious/react';
import type { HighlightStyle, HighlightStyleExpression, RecogitoTextAnnotator, TextAnnotation } from '@recogito/react-text-annotator';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { supabase } from '@backend/supabaseBrowserClient';
import { getAllDocumentLayersInProject } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { ColorState, DocumentNotes, FilterState, DrawerPanel } from '@components/AnnotationDesktop';
import { BrandHeader } from '@components/Branding';
import { LoadingOverlay } from '@components/LoadingOverlay';
import type { TextAnnotationProps } from './TextAnnotation';
import { Toolbar } from './Toolbar';
import { AnnotatedText } from './AnnotatedText';
import { LeftDrawer } from './LeftDrawer/LeftDrawer';
import { RightDrawer } from './RightDrawer';
import type { DocumentLayer } from 'src/Types';

import './TextAnnotationDesktop.css';
import '@recogito/react-text-annotator/react-text-annotator.css';

export const TextAnnotationDesktop = (props: TextAnnotationProps) => {

  const anno = useAnnotator<RecogitoTextAnnotator>();

  const [loading, setLoading] = useState(true);
  
  const [showBranding, setShowBranding] = useState(true);

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const [layers, setLayers] = useState<DocumentLayer[] | undefined>();

  const activeLayer = useMemo(() => (
    layers && layers.length > 0
      ? layers.find((l) => l.is_active) || layers[0]
      : undefined
  ), [layers]);

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const [defaultLayerStyle, setDefaultLayerStyle] =
    useState<HighlightStyleExpression | undefined>(undefined);

  const style: HighlightStyleExpression = useMemo(() => {
    const readOnly = new Set((layers || []).filter(l => !l.is_active).map(l => l.id));

    const readOnlyStyle = (z?: number) => ({
      fillOpacity: 0,
      underlineStyle: 'solid',
      underlineColor: '#000000' as Color,
      underlineOffset: (z || 0) * 3,
      underlineThickness: 2
    } as HighlightStyle);

    return (a: SupabaseAnnotation, state: AnnotationState, z?: number) =>
      (a.layer_id && readOnly.has(a.layer_id)) 
        ? readOnlyStyle(z) : 
          typeof defaultLayerStyle === 'function' ? defaultLayerStyle(a, state, z) : undefined;
  }, [defaultLayerStyle, layers]);

  const [filter, setFilter] = useState<Filter | undefined>(undefined);

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
          if (error) 
              console.error(error);

          const current = new Set(props.document.layers.map(l => l.id));
          
          const toAdd: DocumentLayer[] = data
            .filter(l => !current.has(l.id))
            .map(l => ({ id: l.id, document_id: l.document_id, is_active: false }));

          setLayers([...props.document.layers, ...toAdd]);
        });
      } else {
        setLayers(props.document.layers);
      }
    }
  }, [policies]);

  // TODO clean up!
  const onToggleRightPanel = (panel?: DrawerPanel) => {
    if (panel === DrawerPanel.ANNOTATIONS)
      setUsePopup(false); // Don't use the popup if annotation list is open
    else if (!usePopup)
      setUsePopup(true);

    setRightPanelOpen(true);
  }

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
          a.target.selector[0].pageNumber - b.target.selector[0].pageNumber;
        return pages === 0
          ? a.target.selector[0].start - b.target.selector[0].start
          : pages;
      }
      : (a: TextAnnotation, b: TextAnnotation) =>
        a.target.selector[0].start - b.target.selector[0].start;

  const brandingAnimation = useSpring({
    from: { maxHeight: showBranding ? 0 : 150 },
    to: { maxHeight: showBranding ? 150 : 0 },
    immediate: !layers,
    config: {
      duration: 250,
      easing: easings.easeInOutCubic
    }
  });

  return (
    <FilterState present={present}>
      <ColorState present={present}>
        <DocumentNotes
          channelId={props.channelId}
          layerId={activeLayer?.id}
          present={present}
          onError={() => setConnectionError(true)}>

          <div className="anno-desktop ta-desktop">
            {loading && ( <LoadingOverlay /> )}

            <div className="header">
              <animated.div style={brandingAnimation}>
                <BrandHeader />
              </animated.div>

              <Toolbar
                i18n={props.i18n}
                document={props.document}
                present={present}
                leftDrawerOpen={leftPanelOpen}
                rightDrawerOpen={rightPanelOpen}
                onToggleBranding={() => setShowBranding(!showBranding)}
                onToggleLeftDrawer={() => setLeftPanelOpen(open => !open)}
                onToggleRightDrawer={() => setRightPanelOpen(open => !open)}
                showConnectionError={connectionError} />
            </div>

            <main className={rightPanelOpen ? 'list-open' : undefined}>
              <LeftDrawer 
                i18n={props.i18n}
                open={leftPanelOpen} 
                present={present} 
                onSetFilter={f => setFilter(() => f)} />

              {policies && (
                <AnnotatedText
                  activeLayer={activeLayer}
                  channelId={props.channelId}
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
                  onConnectionError={() => setConnectionError(true)}
                  onSaveError={() => setConnectionError(true)}
                  onLoad={() => setLoading(false)}
                  styleSheet={props.styleSheet} />
              )}

              <RightDrawer
                i18n={props.i18n}
                layers={layers}
                open={rightPanelOpen}
                policies={policies}
                present={present}
                sorting={sorting}
                style={style}
                tagVocabulary={tagVocabulary}
                beforeSelectAnnotation={beforeSelectAnnotation} />
            </main>
          </div>
        </DocumentNotes>
      </ColorState>
    </FilterState>
  )

}
