import { forwardRef, useMemo, useState } from 'react';
import type OpenSeadragon from 'openseadragon';
import { UndoStack } from '@components/AnnotationDesktop';
import type { PrivacyMode } from '@components/PrivacySelector';
import { SupabasePlugin } from '@components/SupabasePlugin';
import type { DocumentLayer, Layer, Policies, Translations } from 'src/Types';
import { Toolpanel } from '../Toolpanel';
import {
  AnnotoriousOpenSeadragonAnnotator,
  DrawingStyle,
  DrawingStyleExpression,
  ImageAnnotation,
  OpenSeadragonAnnotator,
  OpenSeadragonPopup,
  OpenSeadragonViewer,
  PointerSelectAction,
  PresentUser,
  useAnnotator
} from '@annotorious/react';
import { AnnotationPopup } from '@components/AnnotationDesktop/AnnotationPopup';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

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

  policies: Policies;

  present: PresentUser[];

  style?: DrawingStyleExpression<ImageAnnotation>;

  tagVocabulary: string[];

  usePopup: boolean;

  onChangePresent(present: PresentUser[]): void;

  onConnectionError(): void;

  onSaveError(): void;

  onLoad(): void;

}

export const AnnotatedImage = forwardRef<OpenSeadragon.Viewer, AnnotatedImageProps>((props, ref) => {

  const { authToken, i18n, layers, policies, present, tagVocabulary } = props;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const [tool, setTool] = useState<string>('rectangle');

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: props.imageManifestURL,
    gestureSettingsMouse: {
      clickToZoom: false
    },
    ajaxHeaders: authToken ? {
      Authorization: `Bearer ${authToken}`
    } : undefined,
    loadTilesWithAjax: Boolean(authToken),
    ajaxWithCredentials: authToken ? true : undefined,
    showNavigationControl: false,
    minZoomLevel: 0.4,
    visibilityRatio: 0.2,
    preserveImageSizeOnResize: true
  }), [props.imageManifestURL]);

  const selectAction = (annotation: SupabaseAnnotation) => {
    // Annotation targets are editable for creators and admins
    const me = anno?.getUser()?.id;

    const isActiveLayer = annotation.layer_id === props.defaultLayer?.id;

    const canEdit = isActiveLayer && (
      annotation.target.creator?.id === me || policies.get('layers').has('INSERT'));

    return canEdit ? PointerSelectAction.EDIT : PointerSelectAction.SELECT;
  }

  const onChangeTool = (tool: string | null) => {
    if (tool) {
      if (!drawingEnabled) setDrawingEnabled(true);
      setTool(tool);
    } else {
      setDrawingEnabled(false);
    }
  }

  return (
    <OpenSeadragonAnnotator
      autoSave
      drawingEnabled={drawingEnabled}
      pointerSelectAction={selectAction}
      tool={tool}
      filter={props.filter}
      style={props.style}>

      <UndoStack
        undoEmpty={true} />

      {props.layers &&
        <SupabasePlugin
          supabaseUrl={SUPABASE}
          apiKey={SUPABASE_API_KEY}
          channel={props.channelId}
          defaultLayer={props.defaultLayer?.id}
          layerIds={props.layers.map(layer => layer.id)}
          privacyMode={privacy === 'PRIVATE'} 
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
        <OpenSeadragonPopup
          popup={props => (
            <AnnotationPopup
              {...props}
              i18n={i18n}
              layers={layers}
              policies={policies}
              present={present}
              tagVocabulary={tagVocabulary} />)} />
      )}

      <Toolpanel
        i18n={i18n}
        isAdmin={policies.get('layers').has('INSERT')}
        privacy={privacy}
        onChangeTool={onChangeTool}
        onChangePrivacy={setPrivacy} />
    </OpenSeadragonAnnotator>
  )

});