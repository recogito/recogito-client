import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { UndoStack } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import { AnnotationPopup } from '@components/AnnotationDesktop/AnnotationPopup';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useFilter } from '@components/AnnotationDesktop/FilterPanel/FilterState';
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

  isLocked: boolean;

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

  onChangePresent(present: PresentUser[]): void;

  onConnectionError(): void;

  onSaveError(): void;

  onLoad(): void;

}

export const AnnotatedImage = forwardRef<OpenSeadragon.Viewer, AnnotatedImageProps>((props, ref) => {

  const { authToken, i18n, isLocked, layers, layerNames, policies, present, tagVocabulary } = props;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const { filter } = useFilter();

  // Workaround
  const annoRef = useRef<AnnotoriousOpenSeadragonAnnotator>();

  useEffect(() => {
    annoRef.current = anno;
  }, [anno]);

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
  }, [annoRef, props.activeLayer, policies, props.isLocked]);

  useEffect(() => {
    if (props.tool) {
      if (!drawingEnabled)
        setDrawingEnabled(true);
    } else {
      setDrawingEnabled(false);
    }
  }, [props.tool]);

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
          source={props.isPresentationManifest ? props.imageManifestURL : undefined} 
          onInitialLoad={props.onLoad}
          onPresence={props.onChangePresent}
          onConnectError={props.onConnectionError}
          onInitialLoadError={props.onConnectionError}
          onSaveError={props.onSaveError} />
      }

      <OpenSeadragonViewer
        ref={ref}
        className="ia-osd-container"
        options={options} />

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
              tagVocabulary={tagVocabulary} />)} />
      )}
    </OpenSeadragonAnnotator>
  )

});