import { useEffect, useMemo, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { PresentUser, DrawingStyle, Filter, AnnotationState } from '@annotorious/react';
import type { RecogitoTextAnnotator, TextAnnotation } from '@recogito/react-text-annotator';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { supabase } from '@backend/supabaseBrowserClient';
import { getAllDocumentLayersInProject, isDefaultContext } from '@backend/helpers';
import { useLayerPolicies, useTagVocabulary } from '@backend/hooks';
import { ColorState, DocumentNotes, FilterState, DrawerPanel } from '@components/AnnotationDesktop';
import { BrandFooter, BrandHeader } from '@components/Branding';
import { LoadingOverlay } from '@components/LoadingOverlay';
import type { TextAnnotationProps } from './TextAnnotation';
import { Menubar } from './Menubar';
import { AnnotatedText } from './AnnotatedText';
import { RightDrawer } from './RightDrawer';
import type { Layer } from 'src/Types';

import './TextAnnotationDesktop.css';
import '@recogito/react-text-annotator/react-text-annotator.css';

export const TextAnnotationDesktop = (props: TextAnnotationProps) => {

  const anno = useAnnotator<RecogitoTextAnnotator>();

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const [connectionError, setConnectionError] = useState(false);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [rightPanel, setRightPanel] = useState<DrawerPanel | undefined>();

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const [layers, setLayers] = useState<Layer[] | undefined>();

  const [defaultLayerStyle, setDefaultLayerStyle] =
    useState<((a: TextAnnotation, state: AnnotationState, z?: number) => DrawingStyle) | undefined>(undefined);

  const style = useMemo(() => {
    const readOnly = new Set((layers || []).filter(l => !l.is_active).map(l => l.id));

    const readOnlyStyle = (z: number) => ({
      fillOpacity: 0,
      underlineStyle: 'solid',
      underlineColor: '#000',
      underlineOffset: z * 3,
      underlineThickness: 2
    });

    return (a: SupabaseAnnotation, state: any, z: number) =>
      (a.layer_id && readOnly.has(a.layer_id)) ? readOnlyStyle(z) : 
      defaultLayerStyle ? defaultLayerStyle(a as TextAnnotation, state, z) : undefined;
  }, [defaultLayerStyle, layers]);

  const [filter, setFilter] = useState<Filter | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  // Default layer is either the first layer in the project context,
  // or the first layer in the list, if no project context
  const defaultLayer =
    layers && layers.length > 0
      ? layers.find((l) => l.is_active_layer) || layers[0]
      : undefined;

  useEffect(() => {
    if (policies) {
      const isDefault = isDefaultContext(props.document.context);

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
          else setLayers(data);
        });
      } else {
        setLayers(props.document.layers);
      }
    }
  }, [policies]);

  // max number of avatars displayed in the top right
  const limit = 5;

  const onSetRightPanel = (panel?: DrawerPanel) => {
    if (panel === DrawerPanel.ANNOTATIONS)
      setUsePopup(false); // Don't use the popup if annotation list is open
    else if (!usePopup)
      setUsePopup(true);

    setRightPanel(panel);
  }

  const beforeSelectAnnotation = (a?: TextAnnotation) => {
    if (a && !usePopup && anno) {
      // Don't fit the view if the annotation is already selected
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

  return (
    <FilterState present={present}>
      <ColorState present={present}>
        <DocumentNotes
          channelId={props.channelId}
          layerId={defaultLayer?.id}
          present={present}
          onError={() => setConnectionError(true)}>

          <div className="anno-desktop ta-desktop">
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
                rightPanel={rightPanel}
                onToggleBranding={() => setShowBranding(!showBranding)}
                onSetRightDrawer={onSetRightPanel}
                showConnectionError={connectionError} />
            </div>

            <main>
              <div className="ta-drawer ta-drawer-left" />

              {policies && (
                <AnnotatedText
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
                  onConnectionError={() => setConnectionError(true)}
                  onSaveError={() => setConnectionError(true)}
                  onLoad={() => setLoading(false)}
                  styleSheet={props.styleSheet}
                />
              )}

              <RightDrawer
                currentPanel={rightPanel}
                i18n={props.i18n}
                layers={layers}
                policies={policies}
                present={present}
                sorting={sorting}
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
        </DocumentNotes>
      </ColorState>
    </FilterState>
  )

}
