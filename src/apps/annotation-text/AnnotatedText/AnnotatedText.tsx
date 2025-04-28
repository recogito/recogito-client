import { useCallback, useEffect, useState } from 'react';
import { useExtensions } from '@recogito/studio-sdk';
import { useAnnotator, type PresentUser } from '@annotorious/react';
import { TextAnnotationPopup, TextAnnotator } from '@recogito/react-text-annotator';
import type { HighlightStyleExpression, RecogitoTextAnnotator } from '@recogito/react-text-annotator';
import { SelectionURLState, UndoStack, type DocumentNote } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import { useContent } from '../useContent';
import { AnnotationPopup } from '@components/AnnotationDesktop/AnnotationPopup';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
import { AnnotatedTEI } from './AnnotatedTEI/AnnotatedTEI';
import { AnnotatedPDF } from './AnnotatedPDF';
import type { DocumentLayer, DocumentWithContext, EmbeddedLayer, Policies, Translations, VocabularyTerm } from 'src/Types';
import { ExtensionMount } from '@components/Plugins';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

interface AnnotatedTextProps {

  activeLayer?: DocumentLayer;
  
  channelId: string;

  document: DocumentWithContext;

  i18n: Translations;

  isLocked: boolean;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  policies: Policies;

  privacy: PrivacyMode;

  present: PresentUser[];

  style?: HighlightStyleExpression;

  styleSheet?: string;

  tagVocabulary: VocabularyTerm[];

  usePopup: boolean;

  onChangePresent(present: PresentUser[]): void;

  onConnectionError(): void;

  onSaveError(): void;

  onLoad(): void;

  onLoadEmbeddedLayers(layers: EmbeddedLayer[], notes: DocumentNote[]): void;

}

export const AnnotatedText = (props: AnnotatedTextProps) => {

  const { i18n, isLocked, layers, layerNames, policies, present, tagVocabulary } = props;

  const contentType = props.document.content_type;

  const anno = useAnnotator<RecogitoTextAnnotator>();

  const text = useContent(props.document);

  const [annotationsLoading, setAnnotationsLoading] = useState(true);

  const [pdfLoading, setPDFLoading] = useState(
    contentType === 'application/pdf'
  );

  const loading = annotationsLoading || pdfLoading || !text;

  const { filter } = useFilter();

  const extensions = useExtensions('annotation:image:annotator');

  useEffect(() => {
    if (!loading)
      props.onLoad();
  }, [loading]);

  const onInitialSelect = (annotationId: string) => anno.scrollIntoView(annotationId);

  const onPDFRendered = useCallback(() => setPDFLoading(false), [setPDFLoading]);

  return (
    <div className={isLocked 
      ? 'ta-annotated-text-container is-locked'
      : 'ta-annotated-text-container'}>
      <div className="page-wrapper">
        <div className="content-wrapper">
          {contentType === 'text/xml' && text ? (
            <AnnotatedTEI
              filter={filter}
              initialLoadComplete={!loading}
              isLocked={isLocked}
              style={props.style}
              styleSheet={props.styleSheet} 
              text={text} 
              onLoadEmbeddedLayers={props.onLoadEmbeddedLayers} />            
          ) : contentType === 'application/pdf' && text ? (
            <AnnotatedPDF
              document={props.document}
              filter={filter}
              isLocked={isLocked}
              style={props.style}
              onRendered={onPDFRendered} />
          ) : text && (
            <TextAnnotator
              filter={filter}
              annotatingEnabled={!isLocked}
              style={props.style}
              presence={{
                font: '500 12px Inter, Arial, Helvetica, sans-serif',
              }}>
              <p className='plaintext'>{text}</p>
            </TextAnnotator>
          )}

          {(text && !pdfLoading) && (
            <SelectionURLState 
              backButton 
              onInitialSelect={onInitialSelect} />
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

          {extensions.map(({ extension, config }) => (
            <ExtensionMount
              key={extension.name}
              extension={extension}
              pluginConfig={config} 
              anno={anno} />
          ))}

          {props.usePopup && (
            <TextAnnotationPopup
              popup={(props) => (
              <AnnotationPopup
                {...props}
                i18n={i18n}
                isProjectLocked={isLocked}
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