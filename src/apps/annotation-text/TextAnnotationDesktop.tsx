import { useEffect, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { PresentUser, DrawingStyle } from '@annotorious/react';
import type { RecogitoTextAnnotator, TextAnnotation } from '@recogito/react-text-annotator';
import type { PDFAnnotation } from '@recogito/react-pdf-annotator';
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

import './TEI.css';
import './TextAnnotationDesktop.css';
import '@recogito/react-text-annotator/react-text-annotator.css';

export const TextAnnotationDesktop = (props: TextAnnotationProps) => {

  const anno = useAnnotator<RecogitoTextAnnotator>();

  const policies = useLayerPolicies(props.document.layers[0].id);

  const [loading, setLoading] = useState(true);

  const [showBranding, setShowBranding] = useState(true);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [rightPanel, setRightPanel] = useState<DrawerPanel | undefined>();

  const tagVocabulary = useTagVocabulary(props.document.context.project_id);

  const [style, setStyle] = useState<((a: TextAnnotation) => DrawingStyle) | undefined>(undefined);

  const [filter, setFilter] = useState<((a: TextAnnotation) => boolean) | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  const [layers, setLayers] = useState<Layer[] | undefined>();

  // Default layer is either the first layer in the project context,
  // or the first layer in the list, if no project context
  const defaultLayer =
    layers && layers.length > 0
      ? layers.find((l) => !l.context.name) || layers[0]
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

  const onChangeViewMenuPanel = (panel: DrawerPanel | undefined) => {
    if (panel === DrawerPanel.ANNOTATIONS) {
      // Don't use the popup if the annotation list is open
      setUsePopup(false);
    } else {
      if (!usePopup) setUsePopup(true);
    }
  };

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
            a.target.selector.pageNumber - b.target.selector.pageNumber;
          return pages === 0
            ? a.target.selector.start - b.target.selector.start
            : pages;
        }
      : (a: TextAnnotation, b: TextAnnotation) =>
          a.target.selector.start - b.target.selector.start;

  const onError = (error: Error) => {
    // TODO UI feedback
    console.error(error);
  }
  
  return (
    <FilterState present={present}>
      <ColorState present={present}>
        <DocumentNotes
          channelId={props.channelId}
          layerId={defaultLayer?.id}
          present={present}
          onError={onError}>  

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
                onSetRightDrawer={onSetRightPanel} />
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
                  onLoad={() => setLoading(false)} />
              )}

              <RightDrawer
                currentPanel={rightPanel}
                i18n={props.i18n}
                layers={layers}
                policies={policies}
                present={present}
                sorting={sorting}
                tagVocabulary={tagVocabulary}
                beforeSelectAnnotation={beforeSelectAnnotation}
                onChangeAnnotationFilter={f => setFilter(() => f)}
                onChangeAnnotationStyle={s => setStyle(() => s)} /> 
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
