import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { AnnotationPopup, SelectionURLState, UndoStack, useFilter } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useExtensions } from '@recogito/studio-sdk';
import { ExtensionMount } from '@components/Plugins';
import { getImageURL, type IIIFImage } from '../IIIF';
import type { DocumentLayer, Policies, Translations, VocabularyTerm } from 'src/Types';
import type {
  AnnotoriousOpenSeadragonAnnotator,
  DrawingStyleExpression,
  ImageAnnotation,
  PresentUser,
  User
} from '@annotorious/react';
import {
  OpenSeadragonAnnotator,
  OpenSeadragonAnnotationPopup,
  OpenSeadragonViewer,
  UserSelectAction,
  useAnnotator
} from '@annotorious/react';

const SUPABASE: string = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY: string = import.meta.env.PUBLIC_SUPABASE_API_KEY;

interface AnnotatedImageProps {

  activeLayer?: DocumentLayer;

  authToken?: string;

  channelId: string;

  embeddedAnnotations?: any[];

  i18n: Translations;

  isLocked: boolean;

  currentImage: IIIFImage;

  isPresentationManifest?: boolean;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  policies: Policies;

  present: PresentUser[];

  privacy: PrivacyMode;

  style?: DrawingStyleExpression<ImageAnnotation>;

  tagVocabulary: VocabularyTerm[];

  tool?: string;

  usePopup: boolean;

  onChangeImage(url: string): void;

  onChangePresent(present: PresentUser[]): void;

  onConnectionError(): void;

  onNavigateTo(annotation: SupabaseAnnotation): void;

  onPageActivity?(event: { source: string, user: User }): void;

  onSaveError(): void;

  onLoad(): void;

}

export const AnnotatedImage = forwardRef<OpenSeadragon.Viewer, AnnotatedImageProps>((props, ref) => {

  const { 
    authToken, 
    i18n, 
    isLocked, 
    layers, 
    layerNames, 
    policies, 
    present, 
    tagVocabulary,
    onNavigateTo
  } = props;

  const { source, tilesource } = useMemo(() => {
    if (typeof props.currentImage === 'string') {
      // Image API - use URL as both 'source' ID and for tilesource URL
      return { source: props.currentImage, tilesource: props.currentImage }
    } else {
      const tilesource = getImageURL(props.currentImage);
      const source = props.currentImage.uri;
      return { source, tilesource };
    }
  }, [props.currentImage]);

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [initialAnnotations, setInitialAnnotations] = useState<SupabaseAnnotation[]>([]);

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const { filter } = useFilter();

  const extensions = useExtensions('annotation:image:annotator');

  // Workaround
  const annoRef = useRef<AnnotoriousOpenSeadragonAnnotator>();

  useEffect(() => {
    annoRef.current = anno;
  }, [anno]);

  const onInitialLoad = (annotations: SupabaseAnnotation[]) => {
    // In case of IIIF: the annotations in the callback are ALL annotations 
    // for this document, not just the ones for the current page. The 
    // `@recogito/annotorious-supabase` library (used by the SupabasePlugin
    // component) takes care of the filtering.
    setInitialAnnotations(annotations);

    // Add annotations embedded in the manifest, if any
    if (props.embeddedAnnotations && props.embeddedAnnotations.length > 0) {
      anno.setAnnotations(props.embeddedAnnotations, false);
    }

    props.onLoad();
  }

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: {
      tileSource: tilesource,
      loadTilesWithAjax: Boolean(authToken),
      ajaxHeaders: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : undefined
    },
    gestureSettingsMouse: {
      clickToZoom: false,
      dblClickToZoom: false
    },
    // Ommitting this leads to poor performance in Chrome
    crossOriginPolicy: authToken ? undefined : 'Anonymous',
    ajaxWithCredentials: authToken ? true : undefined,
    showNavigationControl: false,
    maxZoomLevel: 100,
    minZoomLevel: 0.1,
    visibilityRatio: 0.2,
    preserveImageSizeOnResize: true
  }), [tilesource]);

  const selectAction = useCallback((annotation: SupabaseAnnotation) => {
    if (props.isLocked) return UserSelectAction.SELECT;
    
    // Directly after creation, annotations have no
    // layer_id (because it gets added later through 
    // the storage plugin).
    const isActiveLayer = 
      annotation.layer_id === undefined ||
      annotation.layer_id === props.activeLayer?.id;

    const me = annoRef.current?.getUser();

    // Annotation targets are editable for creators and admins
    const canEdit = isActiveLayer && (
      annotation.target.creator?.id === me?.id || policies.get('layers').has('INSERT'));

    return canEdit ? UserSelectAction.EDIT : UserSelectAction.SELECT;
  }, [annoRef, props.activeLayer?.id, policies, props.isLocked]);

  useEffect(() => {
    if (props.tool) {
      if (!drawingEnabled)
        setDrawingEnabled(true);
    } else {
      setDrawingEnabled(false);
    }
  }, [props.tool]);

  const onInitialSelectError = (annotationId: string) => {
    // This error will happen if the initial select hits an 
    // annotation that's not in the current image's anno store.
    // This is the expected case if the annotation is in this document,
    // but on a different page!
    const annotation = initialAnnotations.find(a => a.id === annotationId);

    if (annotation) {
      const { source } = annotation.target.selector as any;
      if (source)
        props.onChangeImage(source);
    } else {
      console.warn(`Attempted to select ${annotationId} from hash - does not exist`);
    }
  }

  const onSelectionChange = (user: PresentUser) => props.onPageActivity!({ source, user });

  return (
    <OpenSeadragonAnnotator
      autoSave
      drawingEnabled={drawingEnabled && !isLocked}
      userSelectAction={selectAction}
      tool={props.tool || 'rectangle'}
      filter={filter}
      style={props.style}>

      <UndoStack
        undoEmpty={true} />

      {props.layers &&
        <SupabasePlugin
          supabaseUrl={SUPABASE}
          apiKey={SUPABASE_API_KEY}
          channel={props.channelId}
          defaultLayer={props.activeLayer?.id}
          layerIds={props.layers.map(layer => layer.id)}
          privacyMode={props.privacy === 'PRIVATE'} 
          source={props.isPresentationManifest ? props.currentImage : undefined} 
          onInitialLoad={onInitialLoad}
          onOffPageActivity={props.onPageActivity}
          onPresence={props.onChangePresent}
          onConnectError={props.onConnectionError}
          onInitialLoadError={props.onConnectionError}
          onSaveError={props.onSaveError} 
          onSelectionChange={props.onPageActivity ? onSelectionChange : undefined} />
      }

      <OpenSeadragonViewer
        ref={ref}
        className="ia-osd-container"
        options={options} />

      <SelectionURLState
        backButton 
        onInitialSelectError={onInitialSelectError} />

      {extensions.map(({ extension, config }) => (
        <ExtensionMount
          key={extension.name}
          extension={extension}
          pluginConfig={config} 
          anno={anno} />
      ))}

      {props.usePopup && (
        <OpenSeadragonAnnotationPopup
          popup={props => (
            <AnnotationPopup
              {...props}
              i18n={i18n}
              isProjectLocked={isLocked}
              layers={layers}
              layerNames={layerNames}
              policies={policies}
              present={present}
              tagVocabulary={tagVocabulary} 
              onNavigateTo={onNavigateTo} />)} />
      )}
    </OpenSeadragonAnnotator>
  )

});