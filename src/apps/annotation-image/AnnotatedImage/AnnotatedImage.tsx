import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { AnnotationPopup, SelectionURLState, UndoStack, useFilter } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { DocumentLayer, Policies, Translations } from 'src/Types';
import type {
  AnnotoriousOpenSeadragonAnnotator,
  DrawingStyleExpression,
  ImageAnnotation,
  PresentUser
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

  i18n: Translations;

  imageManifestURL: string;

  isPresentationManifest?: boolean;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  policies: Policies;

  present: PresentUser[];

  privacy: PrivacyMode;

  style?: DrawingStyleExpression<ImageAnnotation>;

  tagVocabulary: string[];

  tool?: string;

  usePopup: boolean;

  onChangeImage(url: string): void;

  onChangePresent(present: PresentUser[]): void;

  onConnectionError(): void;

  onSaveError(): void;

  onLoad(): void;

}

export const AnnotatedImage = forwardRef<OpenSeadragon.Viewer, AnnotatedImageProps>((props, ref) => {

  const { authToken, i18n, layers, layerNames, policies, present, tagVocabulary } = props;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [initialAnnotations, setInitialAnnotations] = useState<SupabaseAnnotation[]>([]);

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const { filter } = useFilter();

  // Workaround
  const annoRef = useRef<AnnotoriousOpenSeadragonAnnotator>();

  useEffect(() => {
    annoRef.current = anno;
  }, [anno]);

  const onInitialLoad = (annotations: SupabaseAnnotation[]) => {
    // In case of IIIF: the annotations in the callback are ALL annotations 
    // for this document, not just the ones for the current page.
    setInitialAnnotations(annotations);
    props.onLoad();
  }

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: props.imageManifestURL,
    gestureSettingsMouse: {
      clickToZoom: false,
      dblClickToZoom: false
    },
    ajaxHeaders: authToken ? {
      Authorization: `Bearer ${authToken}`
    } : undefined,
    loadTilesWithAjax: Boolean(authToken),
    ajaxWithCredentials: authToken ? true : undefined,
    showNavigationControl: false,
    minZoomLevel: 0.1,
    visibilityRatio: 0.2,
    preserveImageSizeOnResize: true
  }), [props.imageManifestURL]);

  const selectAction = useCallback((annotation: SupabaseAnnotation) => {
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
  }, [props.activeLayer?.id, policies]);

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

  return (
    <OpenSeadragonAnnotator
      autoSave
      drawingEnabled={drawingEnabled}
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
          source={props.isPresentationManifest ? props.imageManifestURL : undefined} 
          onInitialLoad={onInitialLoad}
          onPresence={props.onChangePresent}
          onConnectError={props.onConnectionError}
          onInitialLoadError={props.onConnectionError}
          onSaveError={props.onSaveError} />
      }

      <OpenSeadragonViewer
        ref={ref}
        className="ia-osd-container"
        options={options} />

      <SelectionURLState
        backButton 
        onInitialSelectError={onInitialSelectError} />

      {props.usePopup && (
        <OpenSeadragonAnnotationPopup
          popup={props => (
            <AnnotationPopup
              {...props}
              i18n={i18n}
              layers={layers}
              layerNames={layerNames}
              policies={policies}
              present={present}
              tagVocabulary={tagVocabulary} />)} />
      )}
    </OpenSeadragonAnnotator>
  )

});