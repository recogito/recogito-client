import { useEffect, useState } from 'react';
import type { PresentUser } from '@annotorious/react';
import { TextAnnotator, TextAnnotatorPopup } from '@recogito/react-text-annotator';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import { SelectionURLState, UndoStack } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import { useContent } from '../useContent';
import { AnnotationPopup } from '@components/AnnotationDesktop/AnnotationPopup';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import { AnnotatedTEI } from './AnnotatedTEI/AnnotatedTEI';
import { AnnotatedPDF } from './AnnotatedPDF';
import type { DocumentLayer, DocumentWithContext, EmbeddedLayer, Policies, Translations } from 'src/Types';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

interface AnnotatedTextProps {

  activeLayer?: DocumentLayer;
  
  channelId: string;

  document: DocumentWithContext;

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

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

  onLoadEmbeddedLayers(layers: EmbeddedLayer[]): void;

}

export const AnnotatedText = (props: AnnotatedTextProps) => {

  const { i18n, layers, layerNames, policies, present, tagVocabulary } = props;

  const contentType = props.document.content_type;

  const text = useContent(props.document);

  const [annotationsLoading, setAnnotationsLoading] = useState(true);

  const [pdfLoading, setPDFLoading] = useState(
    contentType === 'application/pdf'
  );

  const loading = annotationsLoading || pdfLoading || !text;

  const { filter } = useFilter();

  useEffect(() => {
    if (!loading)
      props.onLoad();
  }, [loading]);

  return (
    <div 
      className="ta-annotated-text-container">
      <div className="page-wrapper">
        <div className="content-wrapper">
          {contentType === 'text/xml' && text ? (
            <AnnotatedTEI
              filter={filter}
              initialLoadComplete={!loading}
              style={props.style}
              styleSheet={props.styleSheet} 
              text={text} 
              onLoadEmbeddedLayers={props.onLoadEmbeddedLayers} />            
          ) : contentType === 'application/pdf' && text ? (
            <AnnotatedPDF
              document={props.document}
              filter={filter}
              style={props.style}
              onRendered={() => setPDFLoading(false)} />
          ) : text && (
            <TextAnnotator
              filter={filter}
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

          <SelectionURLState backButton />

          {props.usePopup && (
            <TextAnnotatorPopup
                popup={(props) => (
                <AnnotationPopup
                  {...props}
                  i18n={i18n}
                  layers={layers}
                  layerNames={layerNames}
                  present={present}
                  policies={policies}
                  tagVocabulary={tagVocabulary} />
              )}
            />
          )}
        </div>
      </div>
    </div>
  )

}