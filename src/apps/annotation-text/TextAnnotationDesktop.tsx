import { useEffect, useRef, useState } from 'react';
import { Annotorious, SupabasePlugin } from '@annotorious/react';
import type { Annotation as Anno, Formatter, PresentUser } from '@annotorious/react';
import { 
  TEIAnnotator, 
  TextAnnotator, 
  RecogitoTextAnnotator, 
  TextAnnotatorPopup, 
  TextAnnotation,
  CETEIcean
} from '@recogito/react-text-annotator';
import { supabase } from '@backend/supabaseBrowserClient';
import { getAllLayersInProject, isDefaultContext } from '@backend/helpers';
import { useLayerPolicies } from '@backend/hooks';
import { PresenceStack, createAppearenceProvider } from '@components/Presence';
import { Annotation } from '@components/Annotation';
import { AnnotationDesktop, ViewMenuPanel } from '@components/AnnotationDesktop';
import { Toolbar } from './Toolbar';
import type { PrivacyMode } from '@components/PrivacySelector';
import { useContent } from './useContent';
import type { DocumentInTaggedContext, Translations, Layer } from 'src/Types';

import './TEI.css';
import './TextAnnotationDesktop.css';
import '@recogito/react-text-annotator/react-text-annotator.css';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface TextAnnotationDesktopProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  channelId: string;

}

export const TextAnnotationDesktop = (props: TextAnnotationDesktopProps) => {

  const { i18n } = props;

  const contentType = props.document.content_type;

  const anno = useRef<RecogitoTextAnnotator>();

  const policies = useLayerPolicies(props.document.layers[0].id);

  const text = useContent(props.document);

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [formatter, setFormatter] = useState<Formatter | undefined>(undefined);

  const [usePopup, setUsePopup] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const [layers, setLayers] = useState<Layer[] | undefined>();

  useEffect(() => {
    if (policies) {
      const isDefault = isDefaultContext(props.document.context);
    
      const isAdmin = policies?.get('layers').has('INSERT');

      // If this is the default context, and the user has
      // sufficient privileges to create layers, load all layers
      if (isDefault && isAdmin) {
        getAllLayersInProject(supabase, props.document.id, props.document.context.project_id)
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

  //max number of avatars displayed in the top right
  const limit = 5;

  const onChangeViewMenuPanel = (panel: ViewMenuPanel | undefined) => {
    if (panel === ViewMenuPanel.ANNOTATIONS) {
      // Don't use the popup if the annotation list is open
      setUsePopup(false);
    } else {
      if (!usePopup)
        setUsePopup(true)
    }
  }

  const beforeSelectAnnotation = (a?: Anno) => {
    if (a && !usePopup && anno.current) {
      const t = a as TextAnnotation;
      // Don't fit the view if the annotation is already selected
      if (anno.current.state.selection.isSelected(t))
        return;

      anno.current.scrollIntoView(t);
    }
  }

  return (
    <div className={contentType === 'text/xml' ? 'content-wrapper tei' : 'content-wrapper text'}>
      <Annotorious ref={anno}>
        <main>
          {contentType === 'text/xml' && text ? (
            <TEIAnnotator
              formatter={formatter}
              presence={{
                font: "500 12px Inter, Arial, Helvetica, sans-serif"
              }}>
              <CETEIcean tei={text} />
            </TEIAnnotator>
          ) : text && (
            <TextAnnotator
              formatter={formatter}
              presence={{
                font: "500 12px Inter, Arial, Helvetica, sans-serif"
              }}>
              {text}
            </TextAnnotator>
          )}
        </main>

        <div className="anno-desktop ta-desktop">
          <AnnotationDesktop.UndoStack 
            undoEmpty={true} />

          {layers && 
            <SupabasePlugin 
              supabaseUrl={SUPABASE}
              apiKey={SUPABASE_API_KEY} 
              channel={props.channelId}
              defaultLayer={props.document.layers[0].id} 
              layerIds={layers.map(layer => layer.id)}
              appearanceProvider={createAppearenceProvider()}
              onPresence={setPresent} 
              privacyMode={privacy === 'PRIVATE'}/>
          }

          {usePopup && (
            <TextAnnotatorPopup
              popup={props => (
                <Annotation.Popup 
                  {...props} 
                  present={present} 
                  policies={policies}
                  i18n={i18n} />
              )} />
          )}

          <div className="anno-desktop-left">
            <AnnotationDesktop.DocumentMenu
              i18n={props.i18n}
              document={props.document} />
          </div>

          <div className="anno-desktop-right not-annotatable">
            <PresenceStack
              present={present}
              limit={limit} />

            <AnnotationDesktop.ViewMenu 
              i18n={i18n}
              present={present} 
              policies={policies}
              layers={layers}
              sorting={(a, b) => a.target.selector.start - b.target.selector.start}
              onChangePanel={onChangeViewMenuPanel}
              onChangeFormatter={f => setFormatter(() => f)}
              beforeSelectAnnotation={beforeSelectAnnotation} />
          </div>

          <div className="anno-desktop-bottom">
            <Toolbar 
              i18n={props.i18n}
              privacy={privacy}
              onChangePrivacy={setPrivacy} />
          </div>
        </div>
      </Annotorious>
    </div>
  )

}