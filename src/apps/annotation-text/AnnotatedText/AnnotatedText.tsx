import { useEffect, useState } from 'react';
import type { DrawingStyle, PresentUser } from '@annotorious/react';
import { CETEIcean, TEIAnnotator, TextAnnotation, TextAnnotator, TextAnnotatorPopup } from '@recogito/react-text-annotator';
import { Annotation } from '@components/Annotation';
import { UndoStack } from '@components/AnnotationDesktop';
import { DynamicStyle } from '@components/DynamicStyle';
import { createAppearenceProvider } from '@components/Presence';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import { PDFViewer } from '../PDFViewer';
import { useContent } from '../useContent';
import { Toolpanel } from '../Toolpanel';
import { behaviors } from './teiBehaviors';
import type { DocumentInTaggedContext, Layer, Policies, Translations } from 'src/Types';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

interface AnnotatedTextProps {

  channelId: string;

  defaultLayer?: Layer;

  document: DocumentInTaggedContext;

  filter?: (a: TextAnnotation) => boolean;

  i18n: Translations;

  layers?: Layer[];

  policies: Policies;

  present: PresentUser[];

  style?: (a: TextAnnotation) => DrawingStyle;

  styleSheet?: string;

  tagVocabulary: string[];

  usePopup: boolean;

  onChangePresent(present: PresentUser[]): void;

  onLoad(): void;

}

export const AnnotatedText = (props: AnnotatedTextProps) => {

  const { i18n, policies, present, tagVocabulary } = props;

  const contentType = props.document.content_type;

  const text = useContent(props.document);

  const [annotationsLoading, setAnnotationsLoading] = useState(true);

  const [pdfLoading, setPDFLoading] = useState(
    contentType === 'application/pdf'
  );

  const loading = annotationsLoading || pdfLoading || !text;

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  useEffect(() => {
    if (!loading)
      props.onLoad();
  }, [loading]);

  return (
    <div className="ta-annotated-text-container">
      <div className="content-wrapper">
        <div
          className={
            contentType === 'text/xml'
              ? 'tei'
              : contentType === 'application/pdf'
              ? 'pdf'
              : 'text'
          }>
          {contentType === 'text/xml' && text ? (
            <>
              <DynamicStyle style={props.styleSheet} />
            
              <TEIAnnotator
                filter={props.filter}
                style={props.style}
                presence={{
                  font: '500 12px Inter, Arial, Helvetica, sans-serif',
                }}>
                <CETEIcean 
                  tei={text} 
                  behaviors={behaviors} />
              </TEIAnnotator>
            </>
          ) : contentType === 'application/pdf' && text ? (
            <PDFViewer
              document={props.document}
              filter={props.filter}
              style={props.style}
              onRendered={() => setPDFLoading(false)} />
          ) : text && (
            <TextAnnotator
              filter={props.filter}
              style={props.style}
              presence={{
                font: '500 12px Inter, Arial, Helvetica, sans-serif',
              }}>
              <p className='plaintext'>{text}</p>
            </TextAnnotator>
          )}

          <UndoStack undoEmpty={true} />

          {props.layers && (
            <SupabasePlugin
              supabaseUrl={SUPABASE}
              apiKey={SUPABASE_API_KEY}
              channel={props.channelId}
              defaultLayer={props.defaultLayer?.id}
              layerIds={props.layers.map((layer) => layer.id)}
              appearanceProvider={createAppearenceProvider()}
              onInitialLoad={() => setAnnotationsLoading(false)}
              onPresence={props.onChangePresent}
              privacyMode={privacy === 'PRIVATE'}
            />
          )}

          {props.usePopup && (
            <TextAnnotatorPopup
              popup={(props) => (
                <Annotation.Popup
                  {...props}
                  i18n={i18n}
                  present={present}
                  policies={policies}
                  tagVocabulary={tagVocabulary}
                />
              )}
            />
          )}
        </div>
      </div>

      <Toolpanel        
        i18n={i18n}
        isAdmin={policies.get('layers').has('INSERT')}
        privacy={privacy}
        onChangePrivacy={setPrivacy} />
    </div>
  )

}