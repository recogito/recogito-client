import { useEffect, useState } from 'react';
import type { Filter, PresentUser } from '@annotorious/react';
import { CETEIcean, HighlightStyleExpression, TEIAnnotator, TextAnnotator, TextAnnotatorPopup } from '@recogito/react-text-annotator';
import { UndoStack } from '@components/AnnotationDesktop';
import { DynamicStyle } from '@components/DynamicStyle';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import { PDFViewer } from '../PDFViewer';
import { useContent } from '../useContent';
import { behaviors } from './teiBehaviors';
import type { DocumentLayer, DocumentWithContext, Policies, Translations } from 'src/Types';
import { AnnotationPopup } from '@components/AnnotationDesktop/AnnotationPopup';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

interface AnnotatedTextProps {

  activeLayer?: DocumentLayer;
  
  channelId: string;

  document: DocumentWithContext;

  filter?: Filter;

  i18n: Translations;

  layers?: DocumentLayer[];

  policies: Policies;

  privacy: PrivacyMode;

  present: PresentUser[];

  style?: HighlightStyleExpression;

  styleSheet?: string;

  tagVocabulary: string[];

  usePopup: boolean;

  onChangePresent(present: PresentUser[]): void;

  onConnectionError(): void;

  onSaveError(): void;

  onLoad(): void;

}

export const AnnotatedText = (props: AnnotatedTextProps) => {

  const { i18n, layers, policies, present, tagVocabulary } = props;

  const contentType = props.document.content_type;

  const text = useContent(props.document);

  const [annotationsLoading, setAnnotationsLoading] = useState(true);

  const [pdfLoading, setPDFLoading] = useState(
    contentType === 'application/pdf'
  );

  const loading = annotationsLoading || pdfLoading || !text;

  useEffect(() => {
    if (!loading)
      props.onLoad();
  }, [loading]);

  return (
    <div className="ta-annotated-text-container">
      <div className="page-wrapper">
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

            {layers && (
              <SupabasePlugin
                supabaseUrl={SUPABASE}
                apiKey={SUPABASE_API_KEY}
                channel={props.channelId}
                defaultLayer={props.activeLayer?.id}
                layerIds={layers.map((layer) => layer.id)}
                onInitialLoad={() => setAnnotationsLoading(false)}
                onPresence={props.onChangePresent}
                onConnectError={props.onConnectionError}
                onInitialLoadError={props.onConnectionError}
                onSaveError={props.onSaveError}
                privacyMode={props.privacy === 'PRIVATE'}
              />
            )}

            {props.usePopup && (
              <TextAnnotatorPopup
                  popup={(props) => (
                  <AnnotationPopup
                    {...props}
                    i18n={i18n}
                    layers={layers}
                    present={present}
                    policies={policies}
                    tagVocabulary={tagVocabulary} />
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )

}